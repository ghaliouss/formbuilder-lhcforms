import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SchemaFormModule, WidgetRegistry } from 'ngx-schema-form';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { ItemComponent } from './item/item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule} from '@angular/material/card';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule} from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSchemaFormComponent } from './ngx-schema-form/ngx-schema-form.component';
// import {DropdownModule, PanelModule, RadioButtonModule} from 'primeng';
// import { ToolbarModule } from 'primeng';
import { TreeModule } from '@circlon/angular-tree-component';
import { ItemJsonEditorComponent } from './lib/widgets/item-json-editor.component';
// import { ArrayGridComponent } from './lib/widgets/array-grid.component';
import { GridComponent } from './lib/widgets/grid.component';
import { TableComponent } from './lib/widgets/table.component';
import { LformsWidgetRegistry} from './lib/lforms-widget-registry';
import { StringComponent } from './lib/widgets/string.component';
import { SelectComponent } from './lib/widgets/select.component';
import { CheckboxComponent } from './lib/widgets/checkbox.component';
import { IntegerComponent } from './lib/widgets/integer.component';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { AppFormElementComponent } from './lib/widgets/form-element.component';
import { LabelComponent } from './lib/widgets/label.component';
import { TitleComponent } from './lib/widgets/title.component';
import { ElementChooserComponent } from './lib/widgets/element-chooser.component';
import { AutoCompleteComponent } from './lib/widgets/auto-complete.component';
import { RadioComponent } from './lib/widgets/radio.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {MatSelectModule} from '@angular/material/select';
import { EnableWhenSourceComponent } from './lib/widgets/enable-when-source.component';
import { EnableOperatorComponent } from './lib/widgets/enable-operator.component';
import { LeftLabelFormGroupComponent } from './lib/widgets/left-label-form-group.component';
import { AppControlWidgetComponent } from './lib/widgets/app-control-widget.component';
import { AppArrayWidgetComponent } from './lib/widgets/app-array-widget.component';
import { SideLabelCheckboxComponent } from './lib/widgets/side-label-checkbox.component';
import { EnablewhenAnswerCodingComponent } from './lib/widgets/enablewhen-answer-coding.component';
import { AppJsonPipe } from './lib/pipes/app-json.pipe';
import { BasePageComponent } from './base-page/base-page.component';
import { FormFieldsComponent } from './form-fields/form-fields.component';
import { LabelRadioComponent } from './lib/widgets/label-radio.component';
import { RowLayoutComponent } from './lib/widgets/row-layout.component';
import { BooleanControlledComponent } from './lib/widgets/boolean-controlled.component';

@NgModule({
  declarations: [
    AppComponent,
    NgxSchemaFormComponent,
    ItemComponent,
    ItemJsonEditorComponent,
    // ArrayGridComponent,
    GridComponent,
    TableComponent,
    StringComponent,
    SelectComponent,
    CheckboxComponent,
    IntegerComponent,
    AppFormElementComponent,
    LabelComponent,
    TitleComponent,
    ElementChooserComponent,
    AutoCompleteComponent,
    RadioComponent,
    HeaderComponent,
    FooterComponent,
    EnableWhenSourceComponent,
    EnableOperatorComponent,
    LeftLabelFormGroupComponent,
    AppControlWidgetComponent,
    AppArrayWidgetComponent,
    SideLabelCheckboxComponent,
    EnablewhenAnswerCodingComponent,
    AppJsonPipe,
    BasePageComponent,
    FormFieldsComponent,
    LabelRadioComponent,
    RowLayoutComponent,
    BooleanControlledComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    LayoutModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule,
    MatStepperModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    NgbModule,
    SchemaFormModule.forRoot(),
    TreeModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
  ],
  providers: [{provide: WidgetRegistry, useClass: LformsWidgetRegistry}],
  bootstrap: [AppComponent]
})
export class AppModule { }
