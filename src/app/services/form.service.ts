/**
 * Form related helper functions.
 */
import {inject, Injectable, SimpleChange} from '@angular/core';
import {IDType, ITreeNode} from '@bugsplat/angular-tree-component/lib/defs/api';
import {TreeModel, TreeNode} from '@bugsplat/angular-tree-component';
import fhir from 'fhir/r4';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MessageDlgComponent, MessageType} from '../lib/widgets/message-dlg/message-dlg.component';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import jsonTraverse from 'traverse';
import {JsonPointer} from 'json-ptr';
import {loadLForms, getSupportedLFormsVersions} from 'lforms-loader';

// Configuration files
// @ts-ignore
import ngxItemSchema from '../../assets/ngx-item.schema.json5';
// @ts-ignore
import fhirSchemaDefinitions from '../../assets/fhir-definitions.schema.json5';
// @ts-ignore
import itemLayout from '../../assets/items-layout.json5';
// @ts-ignore
import ngxFlSchema from '../../assets/ngx-fl.schema.json5';
// @ts-ignore
import flLayout from '../../assets/fl-fields-layout.json5';
// @ts-ignore
import itemEditorSchema from '../../assets/item-editor.schema.json5';
import {GuidingStep, Util} from '../lib/util';
import {FetchService} from './fetch.service';
import {TerminologyServerComponent} from '../lib/widgets/terminology-server/terminology-server.component';
import {ExtensionsService} from './extensions.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

declare var LForms: any;

export interface ErrorNode {
  [fieldName:string]: any [];
}

export interface TreeNodeStatus{
  id: string;
  linkId: string;
  hasError?: boolean;
  childHasError?: boolean;
  errorMessage?: string;
  errors?: ErrorNode;
}

export type TreeNodeStatusMap = {
  [key:string]: TreeNodeStatus;
}

export type LinkIdTrackerMap = {
  [linkIdKey:string] : string[];
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  static _lformsLoaded$ = new Subject<string>();

  private _loading = false;
  _guidingStep$: Subject<GuidingStep> = new Subject<GuidingStep>();
  _formReset$: Subject<void> = new Subject<void>();
  _formChanged$: Subject<SimpleChange> = new Subject<SimpleChange>();
  _advPanelState = {
    formLevel: true,
    itemLevel: true
  }

  localStorageError: Error = null;
  treeModel: TreeModel;
  itemSchema: any = {properties: {}};
  flSchema: any = {properties: {}};
  private _itemEditorSchema: any = {properties: {}};

  snomedUser = false;
  _lformsVersion = '';
  _lformsErrorMessage = null;
  _windowOpenerUrl: string = null;

  fetchService = inject(FetchService);
  formLevelExtensionService = inject(ExtensionsService);

  treeNodeStatusMap: TreeNodeStatusMap;
  linkIdTracker:LinkIdTrackerMap = {};

  constructor(private modalService: NgbModal, private http: HttpClient, private liveAnnouncer: LiveAnnouncer ) {
    [{schema: ngxItemSchema as any, layout: itemLayout}, {schema: ngxFlSchema as any, layout: flLayout}].forEach((obj) => {
      if(!obj.schema.definitions) {
        obj.schema.definitions = {};
      }
      obj.schema.definitions = fhirSchemaDefinitions.definitions as any;
      obj.schema.formLayout = obj.layout.formLayout;
      this.overrideSchemaWidgetFromLayout(obj.schema, obj.layout);
      this.overrideFieldLabelsFromLayout(obj.schema, obj.layout);
    });
    this.itemSchema = ngxItemSchema;
    this.flSchema = ngxFlSchema;
    this._itemEditorSchema = itemEditorSchema;


    // Load lforms.
    this.loadLFormsLib().then((loadedVersion: string) => {
      this._lformsVersion = LForms.lformsVersion;
      FormService._lformsLoaded$.next(this._lformsVersion);
    }).catch((error) => {
      console.error(error);
      this._lformsVersion = 'ERROR';
      FormService._lformsLoaded$.error(error);
    });

  }

  /**
   * Override schema.widget with widget definitions from layout.
   * @param schema - Schema object typically from *-schema.json file.
   * @param widgets - widgets definitions from layout files.
   * @param widgetsMap - An object mapping widget type to list of json pointers to select fields in schema. The selected field's widget
   *   definition is replaced with widget definitions from the layout.
   *   See src/assets/*layout.json5 and src/assets/*schema.json5 files for more information.
   */
  overrideSchemaWidgetFromLayout(schema, {widgets, widgetsMap}) {
    if(!widgetsMap || !widgets) {
      return;
    }

    Object.keys(widgetsMap).forEach((widgetType) => {
      const widgetInfo = widgets[widgetType];
      if(widgetInfo) {
        const fieldPtrs: string[] = widgetsMap[widgetType];
        fieldPtrs?.forEach((ptr) => {
          const fieldSchema: any = JsonPointer.get(schema, ptr);
          if(fieldSchema) {
            fieldSchema.widget = widgetInfo;
          }
        });
      }
    });
  }

  /**
   * Override field labels with custom labels. By default, title attribute of the field is used as label. To override default label,
   * custom labels are defined in layout file.
   * @param schema - Schema object.
   * @param overridePropertyLabels - An object defined in layout file.
   */
  overrideFieldLabelsFromLayout(schema, {overridePropertyLabels}) {
    if(!overridePropertyLabels) {
      return;
    }

    Object.entries(overridePropertyLabels).forEach(([ptr, title]) => {
      const fieldSchema: any = JsonPointer.get(schema, ptr);
      if(fieldSchema) {
        if(fieldSchema) {
          fieldSchema.title = title;
        }
      }
    });
  }

  public get itemEditorSchema() {
    return this._itemEditorSchema;
  }

  /**
   * Get item level schema
   */
  getItemSchema() {
    return this.itemSchema;
  }

  /**
   * Get form level schema
   */
  getFormLevelSchema() {
    return this.flSchema;
  }

  get windowOpenerUrl(): string {
    return this._windowOpenerUrl;
  }

  set windowOpenerUrl(url: string) {
    this._windowOpenerUrl = url;
  }

  get lformsVersion(): string {
    return this._lformsVersion;
  }

  get lformsErrorMessage(): string | null {
    return this._lformsErrorMessage;
  }
  set loading(loading: boolean) {
    this._loading = loading;
  }

  get loading(): boolean {
    return this._loading;
  }

  /**
   * Access guiding step observable.
   */
  get guidingStep$(): Observable<string> {
    return this._guidingStep$.asObservable();
  }

  static get lformsLoaded$(): Observable<string> {
    return FormService._lformsLoaded$.asObservable();
  }

  /**
   * Getter for form reset Observable
   */
  get formReset$(): Observable<void> {
    return this._formReset$.asObservable();
  }

  /**
   * Form changed getter. Triggered when new form is loaded, such as clicking different node on the sidebar.
   * @return - Observable resolving to SimpleChange object.
   */
  get formChanged$(): Observable<SimpleChange> {
    return this._formChanged$.asObservable();
  }

  /**
   * Setter for form level advanced panel state
   */
  set formLevel(collapse: boolean) {
    this._advPanelState.formLevel = collapse;
  }

  /**
   * Getter for form level advanced panel state
   */
  get formLevel(): boolean {
    return this._advPanelState.formLevel;
  }

  /**
   * Setter for item level advanced panel state
   */
  set itemLevel(collapse: boolean) {
    this._advPanelState.itemLevel = collapse;
  }

  /**
   * Getter for item level advanced panel state
   */
  get itemLevel(): boolean {
    return this._advPanelState.itemLevel;
  }

  /**
   * Trigger formChanged$ observable with form changes.
   *
   * @param change - SimpleChange object representing changes to the form.
   */
  formChanged(change: SimpleChange): void {
    this._formChanged$.next(change);
  }

  /**
   * Notify form reset event.
   */
  resetForm(): void {
    this._formReset$.next(null);
  }
  /**
   * Inform the listeners of change in step.
   * @param step
   */
  setGuidingStep(step: GuidingStep) {
    this._guidingStep$.next(step);
  }

  /**
   * Walk through the treeModel and populate the TreeNodeStatus for each of the 
   * TreeNodes into the TreeNodeStatusMap.
   */
  loadTreeNodeStatusMap(): void {
    const treeNodeStatusMap: TreeNodeStatusMap = {};
    function recurse(node: TreeNode): void {
      const tmp: TreeNodeStatus = {
        id: node.id,
        linkId: (node.data.linkId) ? node.data.linkId : ''
      }
      treeNodeStatusMap[node.id.toString()] = tmp;

      if (node.hasChildren) {
        for (const child of node.children) {
          recurse(child);
        }
      }
    }

    if (!this.treeNodeStatusMap || Object.keys(this.treeNodeStatusMap).length === 0) {
      const roots = this.treeModel.roots;
      if (roots) {
        for (const root of roots) {
          recurse(root);
        }
      }

      this.treeNodeStatusMap = treeNodeStatusMap;
    }
  };

  /**
   * Add Tree Node Status for error tracking when an item is added to the Questionnaire
   * @param id - tree node id
   * @param linkId - linkId associated with item of the node.
   */
  addTreeNodeStatus(id: string, linkId: string): void {
    if (!(id in this.treeNodeStatusMap)) {
      const tmp: TreeNodeStatus = {
        id: id,
        linkId: (linkId) ? linkId : ''
      }
      this.treeNodeStatusMap[id] = tmp;
    }
  };

  /**
   * Remove the Tree Node Status from error tracking when the item is deleted.
   * @param id - tree node id
   */
  deleteTreeNodeStatus(id: string): void {
    delete this.treeNodeStatusMap[id];
  }

  /**
   * The 'linkId' must be unique within the questionnaire. Check if the edited 'linkId'
   * already exists in the questionnaire.
   * @param newLinkId - linkId associated with item of the node.
   * @returns true if the edited 'linkId' is not unique, otherwie return false.
   */
  treeNodeHasDuplicateLinkId(newLinkId: string): boolean {
    const node = this.treeModel.getFocusedNode();

    if (!node || !this.treeNodeStatusMap)
      return false;

    return Object.values(this.treeNodeStatusMap).some(item => {
      const nodeItem = this.getTreeNodeStatusById(item.id);

      return (nodeItem.id.toString() !== node.id.toString() && nodeItem.linkId === newLinkId &&
              (!nodeItem?.hasError || (nodeItem?.hasError && !nodeItem.errors?.linkId?.some(err => err.code === "DUPLICATE_LINK_ID"))));
    });
  };

  /**
   * The 'linkId' must be unique within the questionnaire. Check if the edited 'linkId'
   * already exists in the questionnaire using the 'linkIdTracker'.
   * @param newLinkId - linkId associated with item of the node.
   * @returns true if the edited 'linkId' is not unique, otherwie return false.
   */
  treeNodeHasDuplicateLinkIdByLinkIdTracker(newLinkId: string): boolean {
    const node = this.treeModel.getFocusedNode();

    if (!node || !this.treeNodeStatusMap)
      return false;

    return (newLinkId in this.linkIdTracker && ( this.linkIdTracker[newLinkId].length > 1 || (this.linkIdTracker[newLinkId].length === 1 && this.linkIdTracker[newLinkId].indexOf(node.id.toString()) === -1)) );
  };

  /** 
   * Check if the tree node for the given id contains an error.
   * @id - tree node id
   * @includeChildNodes - indicates whether to include child nodes in this check.
   * @returns true if the tree node contains error, otherwise false.
   */
  isTreeNodeHasErrorById(id: string, includeChildNodes: boolean = true): boolean {
    if (this.treeNodeStatusMap && this.treeNodeStatusMap[id]) {
      const nodeHasError = ('hasError' in this.treeNodeStatusMap[id]) ? this.treeNodeStatusMap[id]['hasError'] : false;
      if (includeChildNodes) {
        const childNodeHasError = ('childHasError' in this.treeNodeStatusMap[id]) ? this.treeNodeStatusMap[id]['childHasError'] : false;
        return (nodeHasError || childNodeHasError);
      } else {
        return nodeHasError;
      }
    }
    return false;
  }

  /**
   * Check if the focus node contains an error.
   * @returns true if the focus node contains error, otherwise false.
   */
  isFocusNodeHasError(): boolean {
    if (this.treeModel) {
      const node = this.treeModel.getFocusedNode();
      if (node)
        return this.isTreeNodeHasErrorById(node.id.toString(), false);
    }
    return false;
  }

  /**
   * Return the TreeNodeStatus for the given id.
   * @param id - tree node id.
   * @returns - TreeNodeStatus object if found, otherwise null.
   */
  getTreeNodeStatusById(id: string): TreeNodeStatus | null {
    if (this.treeNodeStatusMap && (id in this.treeNodeStatusMap)) {
      return this.treeNodeStatusMap[id];
    }
    return null;
  }

  /**
   * Check if the sibling nodes contain errors. 
   * @param node - current tree node
   * @returns true if any of the sibling nodes contain errors, otherwise false.
   */
  siblingHasError(node:ITreeNode): boolean {
    let siblingHasError = false;
    if (node.parent && !node.isRoot) {
      siblingHasError = node.parent.children.some((n) => {
        const siblingIdStr = n.id.toString();
        return node.id.toString() !== siblingIdStr && this.treeNodeStatusMap[siblingIdStr]['hasError'];
      });
    }
    return siblingHasError;
  }

  /**
   * Set the ancestor nodes' 'childHasError' status to 'false'.
   * @param node - Ancestor node.
   */
  removeErrorFromAncestorNodes(node: ITreeNode): void {
    const nodeIdStr = node.id.toString();
    if (nodeIdStr in this.treeNodeStatusMap) {
      this.treeNodeStatusMap[nodeIdStr]['childHasError'] = false;
    }

    if (node.parent && !node.isRoot &&
        (!('childHasError' in this.treeNodeStatusMap[nodeIdStr]) || !this.treeNodeStatusMap[nodeIdStr]['childHasError'])) {

      const siblingHasError = this.siblingHasError(node);
      if (!siblingHasError)
        this.removeErrorFromAncestorNodes(node.parent);
    }    
  }

  /**
   * Set the ancestor nodes' 'childHasError' status to 'true'.
   * @param node - Ancestor node.
   */
  addErrorForAncestorNodes(node: ITreeNode): void {
    const nodeIdStr = node.id.toString();

    if (nodeIdStr in this.treeNodeStatusMap) {
      this.treeNodeStatusMap[nodeIdStr]['childHasError'] = true;
    }

    // The root node may have parent, but it is not an item
    if (node.parent && !node.isRoot) {
      this.addErrorForAncestorNodes(node.parent);
    }
  }

  /**
   * Update validation status to the TreeNodeStatusMap.
   * @param id - node id
   * @param linkId - linkId associated with item of the node.
   * @param fieldName - name of the field being validated.
   * @param errors - Null, if the validation passes. Set the 'hasError' status to 'false' 
   *                 and the ancestor nodes' 'chilcHasError' status to 'false'.
   *                 Array of errors if the the validation fails. Set the 'hasError' status
   *                 to 'true' and the ancestor nodes' 'childHasError' status to 'true'.
   *                 Also stores the array of errors objects. 
   */
  updateValidationStatus(id: string, linkId: string, fieldName: string, errors: any[]): void {
    if (!this.treeNodeStatusMap || !this.treeNodeStatusMap[id])
      return;

    this.treeNodeStatusMap[id]['linkId'] = linkId;
    if (errors) {
      if (!this.treeNodeStatusMap[id]['errors'])
        this.treeNodeStatusMap[id]['errors'] = {};
      this.treeNodeStatusMap[id]['errors'][fieldName] = errors;
      this.treeNodeStatusMap[id]['hasError'] = true;
    } else {
      if (this.treeNodeStatusMap[id]['errors'] && fieldName in this.treeNodeStatusMap[id]['errors']) {
        this.liveAnnouncer.announce('Error is resolved for this node.');
        delete this.treeNodeStatusMap[id]['errors'][fieldName];
      }

      this.treeNodeStatusMap[id]['hasError'] = (Object.keys(this.treeNodeStatusMap[id]?.errors ?? {}).length > 0) ? true : false;
    }

    const node = this.getTreeNodeById(id);

    if (node && node.parent && !node.isRoot) {
      if (errors) {
        this.addErrorForAncestorNodes(node.parent);

      } else {
        // Only remove the error from ancestor nodes if 
        // - the focus node does not contain errors
        // - the child nodes do not contain errors 
        // - the sibling nodes do not contain errors
        const siblingHasError = this.siblingHasError(node);
        if (!siblingHasError && Object.keys(this.treeNodeStatusMap[id]?.errors ?? {}).length === 0 &&
            (!('childHasError' in this.treeNodeStatusMap[id]) || !this.treeNodeStatusMap[id]['childHasError']))
          this.removeErrorFromAncestorNodes(node.parent);
      }
    }

    this.autoSaveTreeNodeStatusMap();
  }

  /**
   * Remove TreeNodeStateMap from local storage.
   */
  clearAutoSavedTreeNodeStatusMap() {
    localStorage.removeItem('treeMap');
    this.treeNodeStatusMap = {};
  }

  /**
   * Save tree in local storage.
   * @param fhirQ - Questionnaire
   */
  autoSaveTreeNodeStatusMap() {
    this.autoSave('treeMap', this.treeNodeStatusMap);
  }

  /**
   * Load and initialize the 'linkIdTracker' to track duplicate 
   * 'linkIds' for each tree node.
   */
  loadLinkIdTracker(): void {
    Object.values(this.treeNodeStatusMap).map((node) => {
      const linkId = node.linkId;
      const nodeId = node.id.toString();

      if (linkId in this.linkIdTracker) {
        if (this.linkIdTracker[linkId].indexOf(nodeId) === -1)
          this.linkIdTracker[linkId].push(nodeId);
      } else {
        this.linkIdTracker[linkId] = [nodeId];
      }
    });
  }

  /**
   * Retrieve 'linkIdTracker' for a specified 'linkId'.
   * @param linkId - linkId associated with item of the node. 
   * @returns Array of tree node id(s) if found, otherwise null 
   */
  getLinkIdTrackerByLinkId(linkId: string): string[] | null {
    return (linkId) ? this.linkIdTracker[linkId] : null;
  }

  /**
   * Check if the linkId exists in the Questionnaire/linkIdTracker.
   * @param linkId - linkId associated with item of the node.
   * @returns True if the linkId exists in the linkIdTracker.
   */
  isValidLinkId(linkId: string): boolean {
    return !!this.getLinkIdTrackerByLinkId(linkId);
  }

  /**
   * Add the 'linkId' and associated node id to the 'linkIdTracker'.
   * @param id - tree node id.
   * @param linkId - linkId associated with item of the node. 
   */
  addLinkIdToLinkIdTracker(id: string, linkId: string): void {
    if (linkId in this.linkIdTracker) {
      if (this.linkIdTracker[linkId].indexOf(id) === -1)
        this.linkIdTracker[linkId].push(id);
    } else {
      this.linkIdTracker[linkId] = [id];
    }
  }

  /**
   * Remove the specified 'linkId' from the 'linkIdTracker', but if the 'linkId'
   * corresponds to an array containing multiple ids, only remove the matching
   * 'id' from the array. 
   * @param id - tree node id.
   * @param linkId - linkId associated with item of the node. 
   */
  removeLinkIdFromLinkIdTracker(id: string, linkId: string): void {
    if (linkId in this.linkIdTracker) {
      if (this.linkIdTracker[linkId].length > 1) {
        const index = this.linkIdTracker[linkId].indexOf(id);
        if (index > -1) {
          this.linkIdTracker[linkId].splice(index, 1);
        }
      } else {
        delete this.linkIdTracker[linkId];
      }
    }
  }

  /**
   * Update the 'linkIdTracker' whenever the 'linkId' value changes.
   * @param prevLinkId - existing linkId associated with item of the node. 
   * @param newLinkId - updated linkId associated with item of the node. 
   */
  updateLinkIdForLinkIdTracker(prevLinkId: string, newLinkId: string): void {
    const node = this.treeModel.getFocusedNode();
    if (node) {
      if (prevLinkId)
        this.removeLinkIdFromLinkIdTracker(node.id.toString(), prevLinkId);
      this.addLinkIdToLinkIdTracker(node.id.toString(), newLinkId);
    }
  }

  /**
   * Reset the linkIdTracker
   */
  clearLinkIdTracker(): void {
    this.linkIdTracker = {};
  }

  /**
   * Retrieve tree from the storage.
   */
  autoLoadTreeNodeStatusMap(): TreeNodeStatusMap {
    let treeNodeStatusMap = this.autoLoad('treeMap');

    this.treeNodeStatusMap = treeNodeStatusMap;
    return this.treeNodeStatusMap;
  }

  /**
   * Intended to collect source items for enable when logic
   * Get sources for focused item.
   */
  getSourcesExcludingFocusedTree(): ITreeNode [] {
    let ret = null;
    if (this.treeModel) {
      const fNode = this.treeModel.getFocusedNode();
      ret = this.getEnableWhenSources(fNode);
    }
    return ret;
  }


  /**
   * Get sources excluding the branch of a given node.
   * @param focusedNode
   * @param treeModel?: Optional tree model to search. Default is this.treeModel.
   */
  getEnableWhenSources(focusedNode: ITreeNode, treeModel?: TreeModel): ITreeNode [] {
    if (!treeModel) {
      treeModel = this.treeModel;
    }
    let ret = null;
    if (treeModel) {
      ret = this.getEnableWhenSources_(treeModel.roots, focusedNode);
    }
    return ret;
  }


  /**
   * Get sources from a given list of nodes excluding the branch of focused node.
   * @param nodes - List of nodes to search
   * @param focusedNode - Reference node to exclude the node and its descending branch
   * @private
   */
  private getEnableWhenSources_(nodes: ITreeNode [], focusedNode: ITreeNode): ITreeNode [] {
    const ret: ITreeNode [] = [];
    for (const node of nodes) {
      if (node !== focusedNode) {
        if (node.data.type !== 'group' && node.data.type !== 'display') {
          ret.push(node);
        }
        if (node.hasChildren) {
          ret.push.apply(ret, this.getEnableWhenSources_(node.children, focusedNode));
        }
      }
    }
    return ret;
  }


  /**
   * Setter
   * @param treeModel
   */
  setTreeModel(treeModel: TreeModel) {
    this.treeModel = treeModel;
  }


  /**
   * Get node by its id.
   * @param id
   */
  getTreeNodeById(id: IDType): ITreeNode {
    return this.treeModel.getNodeById(id);
  }


  /**
   * Get a node by linkId from entire tree.
   * @param linkId
   */
  getTreeNodeByLinkId(linkId: string): ITreeNode {
    return this.findNodeByLinkId(this.treeModel.roots, linkId);
  }

  /**
   * Get preferred terminology server walking along the ancestral tree nodes. Returns the first encountered server.
   * @param sourceNode - Tree node to start the traversal.
   * @return - Returns the url of the terminology server extracted from the extension.
   */
  getPreferredTerminologyServer(sourceNode: ITreeNode): string {
    let ret = null;
    Util.traverseAncestors(sourceNode, (node) => {
      const found = node.data.extension?.find((ext) => {
        return ext.url === TerminologyServerComponent.PREFERRED_TERMINOLOGY_SERVER_URI
      });
      ret = found ? found.valueUrl : null;
      return !ret; // Continue traverse if url is not found.
    });
    if(!ret) {
      const ext = this.formLevelExtensionService.getFirstExtensionByUrl(TerminologyServerComponent.PREFERRED_TERMINOLOGY_SERVER_URI)
      ret = ext ? ext.valueUrl : null;
    }
    return ret;
  }


  /**
   * Get a node by linkId from a given set of tree nodes.
   * @param targetNodes - Array of tree nodes
   * @param linkId - linkId associated with item of the node.
   */
  findNodeByLinkId(targetNodes: ITreeNode [], linkId: string): ITreeNode {
    let ret: ITreeNode;
    if (!targetNodes || targetNodes.length === 0) {
      return null;
    }
    for (const node of targetNodes) {
        if (node.data.linkId === linkId) {
          ret = node;
        } else if (node.hasChildren) {
          ret = this.findNodeByLinkId(node.children, linkId);
        }
        if (ret) {
          break;
        }
    }
    return ret;
  }


  /**
   * General purpose information dialog
   *
   * @param title - Title of dialog
   * @param message - Message to display
   * @param type - INFO | WARNING | DANGER
   */
  showMessage(title: string, message: string, type: MessageType = MessageType.INFO) {

    const modalRef = this.modalService.open(MessageDlgComponent, {scrollable: true});
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.type = type;
  }


  /**
   * Parse input string to questionnaire.
   * @param text - Text content of input form, either FHIR questionnaire or LForms format.
   */
  parseQuestionnaire(text: string): fhir.Questionnaire {
    const invalidError = new Error('Not a valid JSON');
    if(!text) {
      throw invalidError;
    }

    let jsonObj = null;
    try {
      jsonObj = JSON.parse(text);
    }
    catch(e) {
      throw invalidError;
    }

    if(jsonObj.resourceType !== 'Questionnaire') {
      if (!!jsonObj.name) {
        jsonObj = LForms.Util._convertLFormsToFHIRData('Questionnaire', 'R4', jsonObj);
      }
      else {
        throw new Error('Not a valid questionnaire');
      }
    }

    jsonObj = this.convertToR4(jsonObj);
    return this.validateFhirQuestionnaire(jsonObj);
  }


  /**
   * Convert a given questionniare to R4 version. R4 is also internal format.
   * Other formats are converted to internal format using LForms library when loading an external form.
   *
   * @param fhirQ - A given questionnaire. Could be STU3, R4 etc.
   */
  convertToR4(fhirQ: fhir.Questionnaire): fhir.Questionnaire {
    let ret = fhirQ;
    const fhirVersion = LForms.Util.guessFHIRVersion(fhirQ);
    if(fhirVersion !== 'R4') {
      ret = LForms.Util.getFormFHIRData(fhirQ.resourceType, 'R4',
        LForms.Util.convertFHIRQuestionnaireToLForms(fhirQ));
    }
    return ret;
  }

  /**
   * Convert R4, which is default internal format, to other formats such as STU3.
   *
   * @param fhirQ - Given questionnaire.
   * @param version -  desired format, such as STU3
   */
  convertFromR4(fhirQ: fhir.Questionnaire, version: string): fhir.Questionnaire {
    let ret = fhirQ;
    if (version === 'LHC-Forms') {
      ret = LForms.Util.convertFHIRQuestionnaireToLForms(fhirQ);
    } else if (version !== 'R4') {
      ret = LForms.Util.getFormFHIRData(fhirQ.resourceType, version,
        LForms.Util.convertFHIRQuestionnaireToLForms(fhirQ));
    }
    return ret;
  }

  /**
   * Possible validation checks.
   *
   * @param json
   */
  validateFhirQuestionnaire(json: any): fhir.Questionnaire {
    jsonTraverse(json).forEach(function(x) {
        if (this.key === 'item') {
          let htIndex = -1;
          const index = x.findIndex((e) => {
            htIndex = Util.findItemIndexWithHelpText(e.item);
            return htIndex >= 0;
          });
          if(index >= 0) {
            const helpText = x[index].item[htIndex].text;
            x[index].item.splice(htIndex, 1);
            if(x[index].item.length === 0) {
              delete x[index].item;
            }
            jsonTraverse(x[index]).set(['__$helpText'], helpText);
          }
        }
    });

    return json as fhir.Questionnaire;
  }


  /**
   * Remove questionnaire from local storage.
   */
  clearAutoSavedForm() {
    localStorage.removeItem('fhirQuestionnaire');
  }


  /**
   * Save questionnaire in local storage
   * @param fhirQ - Questionnaire
   */
  autoSaveForm(fhirQ: fhir.Questionnaire) {
    this.autoSave('fhirQuestionnaire', fhirQ);
    this.notifyWindowOpener({type: 'updateQuestionnaire', questionnaire: fhirQ});
  }


  /**
   * Send data to parent window (window that opened this page).
   *
   * @param data - Data to post.
   */
  notifyWindowOpener(data: any) {
    if(this._windowOpenerUrl) {
      window.opener.postMessage(data, this._windowOpenerUrl);
    }
  }


  /**
   * Retrieve questionnaire from the storage.
   */
  autoLoadForm(): fhir.Questionnaire {
    return this.autoLoad('fhirQuestionnaire') as fhir.Questionnaire;
  }


  /**
   * Store key, value to local storage. Checks the availability of storage before saving.
   * @param key - Key for storage.
   * @param value - Object or string to store.
   */
  autoSave(key: string, value: any) {
    if(this._storageAvailable('localStorage')) {
      if(value) {
        if(key !== 'state' && value) {
          // Non state are objects
          localStorage.setItem(key, JSON.stringify(value));
        }
        else {
          // State is string type.
          localStorage.setItem(key, value);
        }
      }
      else {
        localStorage.removeItem(key);
      }
    }
    else {
      console.error('Local storage not available!');
    }
  }


  /**
   * Retrieve an item from local storage
   * @param key - Key of the item to retrieve
   */
  autoLoad(key: string): any {
    let ret: any = null;
    if(this._storageAvailable('localStorage')) {
      const str = localStorage.getItem(key);
      if(str) {
        if(key !== 'state') {
          ret = JSON.parse(str);
        }
        else {
          ret = str;
        }
      }
    }
    else {
      console.error('Local storage not available!');
    }
    return ret;
  }


  /**
   * Test the storage for availability
   * @param type - localStorage | sessionStorage
   * @return boolean
   */
  _storageAvailable(type): boolean {
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      this.localStorageError = null;
      return true;
    }
    catch(e) {
      this.localStorageError = e;
      return e instanceof DOMException && (
          // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  }


  /**
   * Check if a questionnaire is saved in local storage.
   */
  isAutoSaved(): boolean {
    return !!localStorage.getItem('fhirQuestionnaire');
  }

  /**
   * Get snomed user flag.
   */
  isSnomedUser(): boolean {
    return this.snomedUser;
  }

  /**
   * Set snomed user flag.
   * @param accepted -boolean
   */
  setSnomedUser(accepted: boolean) {
    this.snomedUser = accepted;
    if(this.snomedUser) {
      this.fetchService.fetchSnomedEditions();
    }
  }

  /**
   * Load LForms library at run time.
   * @return - A promise which resolves to version number loaded.
   */
  loadLFormsLib(): Promise<string> {
    return getSupportedLFormsVersions().then((versions) => {
      const latestVersion = versions[0] || '34.3.0';
      return loadLForms(latestVersion).then(() => latestVersion).catch((error) => {
        console.error(`lforms-loader.loadLForms() failed: ${error.message}`);
        throw new Error(error);
      });
    }).catch((error) => {
      console.error(`lforms-loader.getSupportedLFormsVersions() failed: ${error.message}`);
      throw new Error(error);
    });
  }
}
