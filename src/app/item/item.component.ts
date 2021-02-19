/**
 * Handle side bar tree, item level fields editing in ui and editing in json
 */
import {OnInit, AfterViewInit, Component, ViewChild, ElementRef, AfterContentInit, Input} from '@angular/core';
import { TreeComponent, TreeModel, TreeNode, ITreeOptions } from '@circlon/angular-tree-component';
import {FetchService} from '../fetch.service';
import {MatInput} from '@angular/material/input';
import {ShareObjectService} from '../share-object.service';
import {ITreeNode} from '@circlon/angular-tree-component/lib/defs/api';
import {FormService} from '../services/form.service';
import {NgxSchemaFormComponent} from '../ngx-schema-form/ngx-schema-form.component';
import {ItemJsonEditorComponent} from '../lib/widgets/item-json-editor.component';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {Observable, of, Subject} from 'rxjs';
import {AutoCompleteResult} from '../lib/widgets/auto-complete.component';
import { AddItemDialogComponent } from '../lib/widgets/add-item-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';

export class LinkIdCollection {
  linkIdHash = {};

  addLinkId(linkId, itemPath): boolean {
    let ret = false;
    if (linkId && linkId.trim().length > 0) {
      this.linkIdHash[linkId.trim()] = itemPath;
      ret = true;
    }

    return ret;
  }

  getItemPath(linkId): string {
    return this.linkIdHash[linkId];
  }

  hasLinkId(linkId): boolean {
    return this.linkIdHash.hasOwnProperty(linkId);
  }

  deleteLinkId(linkId): boolean {
    let ret = false;
    if (this.getItemPath(linkId)) {
      delete this.linkIdHash[linkId];
      ret = true;
    }
    return ret;
  }

  changeLinkId(oldLinkId, newLinkId): boolean {
    let ret = false;
    const itemPath = this.getItemPath(oldLinkId);
    if (itemPath) {
      this.deleteLinkId(oldLinkId);
      this.addLinkId(newLinkId, itemPath);
      ret = true;
    }
    return ret;
  }
}

@Component({
  selector: 'app-item-component',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit, AfterViewInit {
  id = 1;
  @ViewChild('tree') treeComponent: TreeComponent;
  @ViewChild('jsonEditor') jsonItemEditor: ItemJsonEditorComponent;
  @ViewChild('uiEditor') uiItemEditor: NgxSchemaFormComponent;
  @ViewChild('formSearch') sInput: MatInput;
  @ViewChild('drawer', { read: ElementRef }) sidenavEl: ElementRef;
  @ViewChild('addLoincDlg', { read: ElementRef }) addLNCDlg: ElementRef;
  // qItem: any;
  focusNode: ITreeNode;
  options: ITreeOptions;
  @Input()
  form: any = {item: [{text: 'Item 1'}]};
  exportForm: any;
  isTreeExpanded = false;
  editType = 'ui';
  itemEditorSchema: any;
  editor = 'ngx';

  loincItem: any;
  acOptions = {
    searchUrl: 'https://lforms-fhir.nlm.nih.gov/baseR4/Questionnaire',
    httpOptions: {
      observe: 'body' as const,
      responseType: 'json' as const
    }
  };

  linkIdCollection = new LinkIdCollection();

  acSearch = (term$: Observable<string>): Observable<AutoCompleteResult []> => {
    return term$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => term.length < 2 ? [] : this.dataSrv.searchLoincItems(term)));
  }

  constructor(
              public dialog: MatDialog,
              private modalService: NgbModal,
              private formService: FormService,
              private dataSrv: FetchService,
              private selectedNodeSrv: ShareObjectService) {
    this.options = this.dataSrv.getOptions();
    this.dataSrv.getItemEditorSchema().subscribe((data) => {
      this.itemEditorSchema = data;
    });
  }

  ngOnInit() {
  }


  /**
   * Initialize component
   */
  ngAfterViewInit() {
    // Setup listeners to pickup node selections
   // this.onFocus();
    this.selectedNodeSrv.object$.subscribe((itemData) => {
      if (this.focusNode && this.focusNode.data !== itemData) {
        this.focusNode.data = itemData;
      }
    });
    this.options.scrollContainer = this.sidenavEl.nativeElement;
    this.formService.setTreeModel(this.treeComponent.treeModel);
  }


  /**
   * Tree initialization
   * @param event - a
   */
  onTreeInitialized(event) {
    const node = this.treeComponent.treeModel.getFirstRoot();
    this.treeComponent.treeModel.setFocusedNode(node);
    this.setNode(node);
  }

  onFocus(event) {
    this.setNode(event.node);
  }

  /**
   * Focus node is
   * @param node - a
   */
  setNode(node: ITreeNode): void {
    this.focusNode = node;
    this.selectedNodeSrv.setNode(this.focusNode);
    if (this.focusNode) {
      if (this.focusNode.data && !this.focusNode.data.linkId) {
        this.focusNode.data.linkId = this.defaultLinkId(this.focusNode);
      }
      this.selectedNodeSrv.setObject(this.focusNode.data);
    }
  }

  /**
   * Handle tree expansion/collapse
   */

  toggleTreeExpansion() {
    if (this.treeComponent) {
      if (this.isTreeExpanded) {
        this.treeComponent.treeModel.collapseAll();
        this.isTreeExpanded = false;
      } else {
        this.treeComponent.treeModel.expandAll();
        this.isTreeExpanded = true;
      }
    }
  }

  extractDataFromTree(roots: any [], collection) {
    for (const root of roots) {
      collection.push(root.data);
      if (root.children && root.children.length > 0) {
        collection.item = [];
        this.extractDataFromTree(root.children, collection.item);
      }
    }
  }


  /**
   * Create linkId, using a random number generated by the tree.
   * @param node - a
   */
  defaultLinkId(node: ITreeNode): string {
    return '' + node.id;
  }


  /**
   *
   */
  updatedForm() {
    const items: any = [];
    if (this.treeComponent) {
      const roots = this.treeComponent.treeModel.roots;
      if (roots && roots.length > 0) {
        this.extractDataFromTree(roots, items);
      }
    }
    this.exportForm = this.form;
    this.exportForm.item = items;
    return this.exportForm;
  }

  /**
   * Toggle between ui and json
   * @param event - a
   */
  toggleEditType(event) {
    this.editType = this.editType === 'json' ? 'ui' : 'json';
    if (event.index > 0) {
      this.updatedForm();
    }
  }


  /**
   * Compute tree hierarchy sequence numbering.
   * @param node - Target node of computation
   */
  getIndexPath(node: ITreeNode): number[] {
    const ret: number [] = [];
    if (node) {
      ret.push(node.index + 1);
      while (node.level > 1) {
        node = node.parent;
        ret.push(node.index + 1);
      }
    }
    return ret.reverse();
  }


  /**
   * Handle add item button
   * @param event - a
   */
  addItem(event): void {
    this.insertAnItem({text: 'New item ' + this.id++});
  }

  insertAnItem(item, index?: number) {
    if (typeof index === 'undefined') {
      index = this.focusNode.index + 1;
    }
    this.focusNode.parent.data.item.splice(index, 0, item);
    this.treeComponent.treeModel.update();
    this.treeComponent.treeModel.focusNextNode();
    this.setNode(this.treeComponent.treeModel.getFocusedNode());
  }

  /**
   * TODO - Add loinc item from fhir server.
   * @param event - a
   */
  addLoincItem(dlgContent): void {
    // this.addItem(event);
    this.modalService.open(dlgContent, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      if (result) {
        console.log('result: ' + result);
        this.getLoincItem(result).subscribe((item) => {
          if (item) {
            this.insertAnItem(item, this.focusNode.index + 1);
          }
        });
      } else {
        this.loincItem = null;
      }
    }, (reason) => {
      console.log('reason: ' + reason);
      this.loincItem = null;
    });
  }

  addLOINCItem(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.getLoincItem(result).subscribe((item) => {
        this.insertAnItem(item);
      });
    });
  }

  addLoincItemNgb(dialogTemplateRef): void {
    this.modalService.open(dialogTemplateRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.getLoincItem(result).subscribe((item) => {
        this.insertAnItem(item);
      });
    }, (reason) => {
    });
  }

  /**
   *
   * @param loincNum - Loinc number of the item.
   */
  getLoincItem(loincNum): Observable<any> {
    return this.dataSrv.getLoincItem(loincNum);
  }

  /**
   * TODO - not sure if we need this yet.
   * @param linkId - a
   */
  registerLinkId(linkId) {
    this.linkIdCollection.addLinkId(linkId, this.focusNode.path.join('/'));
  }

  /**
   * Fetch loinc item by id
   * loincNum - Loinc number of the item.
   *
   */
  getItem(loincNum: string) {
  }

  formatter(acResult: AutoCompleteResult) {
    return acResult.id + ': ' + acResult.title;
  }
}
