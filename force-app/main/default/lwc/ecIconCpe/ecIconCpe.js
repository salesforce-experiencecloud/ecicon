/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api } from 'lwc';
import {getFaIconDictionary} from './faIconDictionary';
import {getSLDSIconDictionary} from './sldsIconDictionary';
import {getGFIconDictionary} from './gfIconDictionary';
import faMain from '@salesforce/resourceUrl/fontawesome';
import gfOutlined from '@salesforce/resourceUrl/googlefontsoutlined';
import gfRounded from '@salesforce/resourceUrl/googlefontsrounded';
import gfSharp from '@salesforce/resourceUrl/googlefontssharp';
import { loadStyle } from 'lightning/platformResourceLoader';
import * as generalUtils from 'c/gtaUtilsGeneral';
import {displayLightningInputError} from 'c/gtaUtilsComponent';
import ToastContainer from 'lightning/toastContainer';
import { ShowToastEvent } from "lightning/platformShowToastEvent";


const typeDelay = 1000;
const maxResults = 100;
const defaultCSSClasses = 'slds-m-bottom_medium';
const propertyEditorWidthStyle = ':root {--cb-property-editor-width: 400px;}';
const classesNotSelected = 'slds-text-align_center slds-p-around_medium no-decoration';
const classesSelected = classesNotSelected + ' selectedIcon';

const copyToClipboardText = 
'<!-- ecicon fonts -->\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-brands-400.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-regular-400.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsoutlined/webfonts/MaterialSymbolsOutlined.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsrounded/webfonts/MaterialSymbolsRounded.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontssharp/webfonts/MaterialSymbolsSharp.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>\n\
\n\
<!-- ecicon stylesheets -->\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/brands.min.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/regular.min.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/solid.min.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/fontawesome.min.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsoutlined/css/MaterialSymbolsOutlined.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsrounded/css/MaterialSymbolsRounded.css?{ versionKey }" />\n\
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontssharp/css/MaterialSymbolsSharp.css?{ versionKey }" />\n\
';

export default class EcIconCpe extends LightningElement {

    uuid = generalUtils.generateUniqueIdentifier();

    @track iconDictionary;
    @track showModal = false;
    @track searchTerm = '';
    @track searchResults;
    @track saveError;
    @track selectedIconName;
    @track selectedIconType;
    @track selectedIconStyle;
    @track typeFilter = 'all';
    @track styleFilter = 'all';
    @track searchMessage;
    @track searchLabel = 'Search Icons';
    @track searchPaginator = {};

    styleFilterOptionsSLDS = [
        { label: 'Utility', value: 'utility' },
        { label: 'Standard', value: 'standard' },
        { label: 'Custom', value: 'custom' },
        { label: 'Action', value: 'action' },
        { label: 'DocType', value: 'doctype'}
    ];

    styleFilterOptionsFA = [
        { label: 'Solid', value: 'solid' },
        { label: 'Regular', value: 'regular' },
        { label: 'Brands', value: 'brands' }
    ];

    styleFilterOptionsGF = [
        { label: 'Outlined', value: 'outlined' },
        { label: 'Rounded', value: 'rounded' },
        { label: 'Sharp', value: 'sharp' }
    ];

    typeFilterOptions = [
        { label: 'All', value: 'all' },
        { label: 'SLDS (slds)', value: 'slds' },
        { label: 'Font Awesome (fa)', value: 'fa' },
        { label: 'Google Fonts (gf)', value: 'gf' }
    ]

    @track propInputs = {
        /*
            template: {
                key: 'template', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Template', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'template', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.template', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleTestChange, //onchange handler for html lightning-input tag
            },
        */
        chooseIconButton: {
            key: 'chooseIconButton', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Choose Icon', //label used for html lighting-input tag
            buttonLabel: 'Select Icon',
            type: 'text', //type used for html lightning-input tag
            help: 'Select Icon to render', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'chooseIconButton', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            clickHandler: this.handleChooseIconButtonClick, //onchange handler for html lightning-input tag
        },
        iconName: {
            key: 'iconName', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Name', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'Name of the Icon', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconName', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-vertical_medium', //css classes for html lightning-input tag
            changeHandler: undefined, //onchange handler for html lightning-input tag
        },
        dataBindedIconName: {
            key: 'dataBindedIconName', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Data Binded Icon Name', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'A Data Binding expression, such as {!Item.Field__c}, which evaluates to a value such as solid:fa-solid fa-at.', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'dataBindedIconName', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-vertical_medium', //css classes for html lightning-input tag
            changeHandler: this.handleDataBindedIconNameChange, //onchange handler for html lightning-input tag
        },
        iconType: {
            key: 'iconType', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Type', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'Icon Type', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconType', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + 'slds-size_3-of-12', //css classes for html lightning-input tag
            changeHandler: undefined, //onchange handler for html lightning-input tag
            
        },
        iconStyle: {
            key: 'iconStyle', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Style', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'Style of the Icon', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconStyle', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-vertical_medium', //css classes for html lightning-input tag
            changeHandler: undefined, //onchange handler for html lightning-input tag
        },
        iconSize: {
            key: 'iconSize', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Size (in px) - Desktop', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon size in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconSize', //property path within the value object
            value: 25, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleIconSizeChange, //onchange handler for html lightning-input tag
        },
        iconSizeTablet: {
            key: 'iconSizeTablet', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Size (in px) - Tablet', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon size in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconSizeTablet', //property path within the value object
            value: 25, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleIconSizeTabletChange, //onchange handler for html lightning-input tag
        },
        iconSizeMobile: {
            key: 'iconSizeMobile', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Size (in px) - Mobile', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon size in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconSizeMobile', //property path within the value object
            value: 25, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleIconSizeMobileChange, //onchange handler for html lightning-input tag
        },
        iconColor: {
            key: 'iconColor', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Color', //label used for html lighting-input tag
            type: 'color', //type used for html lightning-input tag
            help: 'Icon Color', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconColor', //property path within the value object
            value: '#838383', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleIconColorChange, //onchange handler for html lightning-input tag
        },
        backgroundColor: {
            key: 'backgroundColor', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Background Color', //label used for html lighting-input tag
            type: 'color', //type used for html lightning-input tag
            help: 'Background Color', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'backgroundColor', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleBackgroundColorChange, //onchange handler for html lightning-input tag
        },
        borderSize: {
            key: 'borderSize', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Border Size (in px)', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Border size in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'borderSize', //property path within the value object
            value: 0, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleBorderSizeChange, //onchange handler for html lightning-input tag
        },
        borderColor: {
            key: 'borderColor', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Border Color', //label used for html lighting-input tag
            type: 'color', //type used for html lightning-input tag
            help: 'Border Color', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'borderColor', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleBorderColorChange, //onchange handler for html lightning-input tag
        },
        iconShape: {
            key: 'iconShape', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Shape', //label used for html lighting-input tag
            type: 'select', //type used for html lightning-input tag
            help: 'Icon Shape', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconShape', //property path within the value object
            value: 'square', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconShapeChange, //onchange handler for html lightning-input tag
            options:[
                {label: 'Square', value: 'square'},
                {label: 'Circle', value: 'circle'}
            ],
        },
        iconPadding: {
            key: 'iconPadding', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Horizontal Icon Padding (in px) - Desktop', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Horizontal Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPadding', //property path within the value object
            value: 15, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingChange, //onchange handler for html lightning-input tag
        },
        iconPaddingTablet: {
            key: 'iconPaddingTablet', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Horizontal Icon Padding (in px) - Tablet', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Horizontal Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPaddingTablet', //property path within the value object
            value: 15, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingTabletChange, //onchange handler for html lightning-input tag
        },
        iconPaddingMobile: {
            key: 'iconPaddingMobile', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Horizontal Icon Padding (in px) - Mobile', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Horizontal Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPaddingMobile', //property path within the value object
            value: 15, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingMobileChange, //onchange handler for html lightning-input tag
        },
        iconPaddingVertical: {
            key: 'iconPaddingVertical', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Vertical Icon Padding (in px) - Desktop', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Vertical Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPaddingVertical', //property path within the value object
            value: 5, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingVerticalChange, //onchange handler for html lightning-input tag
        },
        iconPaddingVerticalTablet: {
            key: 'iconPaddingVerticalTablet', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Vertical Icon Padding (in px) - Tablet', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Vertical Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPaddingVerticalTablet', //property path within the value object
            value: 5, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingVerticalTabletChange, //onchange handler for html lightning-input tag
        },
        iconPaddingVerticalMobile: {
            key: 'iconPaddingVerticalMobile', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Vertical Icon Padding (in px) - Mobile', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Icon Vertical Padding in pixels', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'iconPaddingVerticalMobile', //property path within the value object
            value: 5, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconPaddingVerticalMobileChange, //onchange handler for html lightning-input tag
        },
        iconAlignment: {
            key: 'iconAlignment', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Alignment - Desktop', //label used for html lighting-input tag
            type: 'select', //type used for html lightning-input tag
            help: 'Icon Alignment', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconAlignment', //property path within the value object
            value: 'center', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconAlignmentChange, //onchange handler for html lightning-input tag
            options:[
                {label: 'Center', value: 'center'},
                {label: 'Left', value: 'left'},
                {label: 'Right', value: 'right'}
            ],
        },
        iconAlignmentTablet: {
            key: 'iconAlignmentTablet', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Alignment - Tablet', //label used for html lighting-input tag
            type: 'select', //type used for html lightning-input tag
            help: 'Icon Alignment', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconAlignmentTablet', //property path within the value object
            value: 'center', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconAlignmentTabletChange, //onchange handler for html lightning-input tag
            options:[
                {label: 'Center', value: 'center'},
                {label: 'Left', value: 'left'},
                {label: 'Right', value: 'right'}
            ],
        },
        iconAlignmentMobile: {
            key: 'iconAlignmentMobile', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Icon Alignment - Mobile', //label used for html lighting-input tag
            type: 'select', //type used for html lightning-input tag
            help: 'Icon Alignment', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'iconAlignmentMobile', //property path within the value object
            value: 'center', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleIconAlignmentMobileChange, //onchange handler for html lightning-input tag
            options:[
                {label: 'Center', value: 'center'},
                {label: 'Left', value: 'left'},
                {label: 'Right', value: 'right'}
            ],
        },
        strokeSize: {
            key: 'strokeSize', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Stroke Size (in px)', //label used for html lighting-input tag
            type: 'number', //type used for html lightning-input tag
            help: 'Stroke size in pixels (outline around the icon)', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'strokeSize', //property path within the value object
            value: 0, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-top_medium', //css classes for html lightning-input tag
            changeHandler: this.handleStrokeSizeChange, //onchange handler for html lightning-input tag
        },
        strokeColor: {
            key: 'strokeColor', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Stroke Color', //label used for html lighting-input tag
            type: 'color', //type used for html lightning-input tag
            help: 'Stroke Color (outline around the icon)', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'strokeColor', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleStrokeColorChange, //onchange handler for html lightning-input tag
        },

    };

    @api
    get value() {
        return this._value;
    }

    set value(value) {
       
        let valuetmp = JSON.parse(value);
        let isValueUndefined = this._value === undefined;
        this._value = {};
        let hasValueChanged = false;

        for (let key in this.propInputs) {
            
            if(generalUtils.objectHasProperty(this.propInputs, key) && this.propInputs[key].doSetDefaultValue === true)
            {
                let tmpVal = generalUtils.getObjPropValue(valuetmp, this.propInputs[key].valuePath);
                if(generalUtils.isObjectEmpty(tmpVal))
                {
                    tmpVal = this.propInputs[key].value;
                    if(((this.propInputs[key].type === 'text' || this.propInputs[key].type === 'select' ||  this.propInputs[key].type === 'search') 
                        && !generalUtils.isStringEmpty(tmpVal)) 
                        ||
                        ((this.propInputs[key].type === 'toggle' || this.propInputs[key].type === 'checkbox' || this.propInputs[key].type === 'number' ) && !generalUtils.isObjectEmpty(tmpVal)))
                    {
                        valuetmp = generalUtils.setObjPropValue(valuetmp, this.propInputs[key].valuePath, tmpVal);
                        value = JSON.stringify(valuetmp);
                        hasValueChanged = true;
                    }
                    
                }
                if(this.propInputs[key].value !== tmpVal)
                {
                    if(key === 'iconName')
                    {
                        this.selectedIconName = tmpVal;
                        let e = {};
                        e.target = {};
                        e.target.dataset = {};
                        e.target.dataset.id = tmpVal;
                        
                        this.handleSelectIcon(e);
                        
                    }
                    this.propInputs[key].value = tmpVal;
                }
            }

            

        }

        this._value = value;
        if(hasValueChanged === true)
        {
            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: value}}));
        }
    }

    getValueObj()
    {
        let tmpvalueObj = (generalUtils.isStringEmpty(this.value)) ? {} : JSON.parse(this.value);
        return tmpvalueObj;
    }

    get modalClass() {
        let classNames = 'slds-modal slds-modal_large slds-fade-in-open';
        return classNames;
    }

    get displayBackdrop() {
        return this.showModal;
    }

    get isIconSelected()
    {
        return generalUtils.isStringEmpty(this.propInputs.iconName.value) === false;
    }

    get isIconSlds()
    {
        return (generalUtils.isStringEmpty(this.propInputs.iconType.value) === false && this.propInputs.iconType.value === 'slds');
    }

    get isIconSldsNewSelection()
    {
        return (generalUtils.isStringEmpty(this.selectedIconType) === false && this.selectedIconType === 'slds');
    }

    get isIconFa()
    {
        return (generalUtils.isStringEmpty(this.propInputs.iconType.value) === false && this.propInputs.iconType.value === 'fa');
    }

    get isIconGf()
    {
        return (generalUtils.isStringEmpty(this.propInputs.iconType.value) === false && this.propInputs.iconType.value === 'gf');
    }

    get styleFilterOptions()
    {
        let filters = [{label:"All", value:"all"}];

        if(this.typeFilter === 'slds')
        {
            return filters.concat(this.styleFilterOptionsSLDS);
        }
        else if(this.typeFilter === 'fa')
        {
            return filters.concat(this.styleFilterOptionsFA);
        }
        else if(this.typeFilter === 'gf')
        {
            return filters.concat(this.styleFilterOptionsGF);
        }
        else 
        {
            return filters.concat(this.styleFilterOptionsSLDS).concat(this.styleFilterOptionsFA).concat(this.styleFilterOptionsGF);
        }
    }

    connectedCallback() {
        Promise.all([
            loadStyle(this, '/sfsites/c' + faMain + '/css/brands.min.css'),
            loadStyle(this, '/sfsites/c' + faMain + '/css/regular.min.css'),
            loadStyle(this, '/sfsites/c' + faMain + '/css/solid.min.css'),
            loadStyle(this, '/sfsites/c' + faMain + '/css/fontawesome.min.css'),
            loadStyle(this, '/sfsites/c' + gfOutlined + '/css/MaterialSymbolsOutlined.css'),
            loadStyle(this, '/sfsites/c' + gfRounded + '/css/MaterialSymbolsRounded.css'),
            loadStyle(this, '/sfsites/c' + gfSharp + '/css/MaterialSymbolsSharp.css')
        ]).then(() => {
        
        }).catch(error => {
            
        }).finally( () => {

        });

        let faIconDictionary = getFaIconDictionary();
            let sldsIconDictionary = getSLDSIconDictionary();
            let gfIconDictionary = getGFIconDictionary();
            let keySet = [];

            this.iconDictionary = [];
            if(generalUtils.isArrayEmpty(faIconDictionary) === false)
            {
                faIconDictionary.forEach((icon) => {
                    icon.styles.split(',').forEach((style) => {
                        let tmpIcon = {};
                        tmpIcon.id = style + ':fa-' + style + ' fa-' + icon.key;
                        tmpIcon.index = this.iconDictionary.length + 1;
                        tmpIcon.type = 'fa';
                        tmpIcon.isExternal = true;
                        tmpIcon.isSelected = false;
                        tmpIcon.classes = classesNotSelected;
                        tmpIcon.name = icon.label;
                        tmpIcon.style = style;
                        tmpIcon.key = tmpIcon.type +':' + tmpIcon.style +':' + icon.key;
                        if(keySet.includes(tmpIcon.key) === false)
                        {
                            this.iconDictionary.push(tmpIcon);
                            keySet.push(tmpIcon.key);
                        }
                        
                    });
                    
                });
            }

            if(generalUtils.isArrayEmpty(sldsIconDictionary) === false)
            {
                sldsIconDictionary.forEach((icon) => {
                    let tmpIcon = {};
                    tmpIcon.id = icon.style + ':' + icon.name;
                    tmpIcon.index = this.iconDictionary.length + 1;
                    tmpIcon.type = 'slds';
                    tmpIcon.isExternal = false;
                    tmpIcon.isSelected = false;
                    tmpIcon.classes = classesNotSelected;
                    tmpIcon.name = icon.name;
                    tmpIcon.style = icon.style;
                    tmpIcon.key = tmpIcon.type +':' + tmpIcon.style +':' + icon.name;
                    if(keySet.includes(tmpIcon.key) === false)
                    {
                        this.iconDictionary.push(tmpIcon);
                        keySet.push(tmpIcon.key);
                    }
                });
            }

            if(generalUtils.isArrayEmpty(gfIconDictionary) === false)
                {
                    gfIconDictionary.forEach((icon) => {
                        
                        let tmpIcon = {};
                        tmpIcon.id = 'outlined:'+icon.name;
                        tmpIcon.index = this.iconDictionary.length + 1;
                        tmpIcon.type = 'gf';
                        tmpIcon.isExternal = true;
                        tmpIcon.isSelected = false;
                        tmpIcon.classes = classesNotSelected;
                        tmpIcon.name = icon.label;
                        tmpIcon.name = (generalUtils.isStringEmpty(tmpIcon.name) === false) ? tmpIcon.name : icon.name;
                        tmpIcon.style = 'outlined';
                        tmpIcon.key = tmpIcon.type +':' + tmpIcon.style +':' + icon.name;
                        if(keySet.includes(tmpIcon.key) === false)
                        {
                            this.iconDictionary.push(tmpIcon);
                            keySet.push(tmpIcon.key);
                        }

                        let tmpIcon2 = generalUtils.cloneObjectWithJSON(tmpIcon);
                        tmpIcon2.id = 'rounded:' + icon.name;
                        tmpIcon2.style = 'rounded';
                        tmpIcon2.index = this.iconDictionary.length + 1;
                        tmpIcon2.key = tmpIcon2.type +':' + tmpIcon2.style +':' + icon.name;
                        if(keySet.includes(tmpIcon2.key) === false)
                        {
                            this.iconDictionary.push(tmpIcon2);
                            keySet.push(tmpIcon2.key);
                        }

                        let tmpIcon3 = generalUtils.cloneObjectWithJSON(tmpIcon);
                        tmpIcon3.id = 'sharp:' + icon.name;
                        tmpIcon3.style = 'sharp';
                        tmpIcon3.index = this.iconDictionary.length + 1;
                        tmpIcon3.key = tmpIcon3.type +':' + tmpIcon3.style +':' + icon.name;
                        if(keySet.includes(tmpIcon3.key) === false)
                        {
                            this.iconDictionary.push(tmpIcon3);
                            keySet.push(tmpIcon3.key);
                        }
                        
                    });
                }

            sldsIconDictionary = undefined;
            faIconDictionary = undefined;
            gfIconDictionary = undefined;
            keySet = undefined;

            //console.log(JSON.parse(JSON.stringify(this.iconDictionary)));
            this.initializePagination(this.iconDictionary);
            //this.searchResults = this.iconDictionary.slice(0,maxResults);
            this.searchLabel = 'Search ' + this.iconDictionary.length + ' Icons';
            this.searchMessage = 'Displaying 1-' + this.searchResults.length + ' / ' + this.iconDictionary.length + ' results.';

        
    }

    handleChooseIconButtonClick(e) {
        this.showModal = true;
    }

    handleCloseModal(e) {
        this.showModal = false;
    }

    handleSearch(e) {
        window.clearTimeout(this.searchTextDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchTextDelayTimeout = setTimeout(() => {

            let inputvalue = e.detail.value.trim();
            this.searchTerm = (generalUtils.isStringEmpty(inputvalue) === false) ? inputvalue.toLowerCase() : '';
            this.doSearch();
            

        }, typeDelay);
    }

    handleTypeFilterChange(e) {
        let selectedValue = e.detail.value;
        this.typeFilter = selectedValue;
        this.styleFilter = 'all';
        this.template.querySelector('[data-key="styleFilter"]').value = 'all';
        this.doSearch();
    }

    handleStyleFilterChange(e) {
        let selectedValue = e.detail.value;
        this.styleFilter = selectedValue;
        this.doSearch();
    }

    doSearch() {

        let tmpResults;
        this.searchMessage = undefined;

       let filters = {
            type: item => item.type === this.typeFilter,
            style: item => item.style === this.styleFilter,
            term: item => (item.id.toLowerCase().includes(this.searchTerm) || item.name.toLowerCase().includes(this.searchTerm))
        }

        let selectedFilters = [];
        selectedFilters.push(filters.term);
        if(this.typeFilter !== 'all')
        {
            selectedFilters.push(filters.type);
        }
        if(this.styleFilter !== 'all')
        {
            selectedFilters.push(filters.style);
        }
        

        this.searchResults = this.iconDictionary.filter(  
            item => selectedFilters.every(f => f(item))
        );
        let totalMatches = this.searchResults.length;

        this.initializePagination(this.searchResults);

        //this.searchResults = this.searchResults.slice(0,maxResults);

        

        if(this.searchResults.length === 0)
        {
            this.searchMessage = 'No results found. Try another search term using 1 keyword.';
        }
        else if(this.searchResults.length === maxResults)
        {
            this.searchMessage = 'Displaying 1-' + this.searchResults.length + ' out of ' + totalMatches + ' total matching results.';
        }
        else if(this.searchResults.length > 0 && this.searchResults.length < maxResults)
        {
            this.searchMessage = 'Displaying 1-' + this.searchResults.length + ' out of ' + totalMatches + ' total matching results.';
        }
        

    }

    initializePagination(searchResults)
    {
        let pageIndex = 0;
        this.searchPaginator.allResults = [];
        this.searchPaginator.currentIndex = 0;
        this.searchPaginator.currentPageIsLast = false;
        this.searchPaginator.currentPageIsFirst = true;
        this.searchPaginator.totalResults = searchResults.length;
        while(pageIndex < searchResults.length)
        {
            
            let resultsLeft = searchResults.length - pageIndex;
            let sliceEnd = (resultsLeft < maxResults) ? resultsLeft : maxResults;
            this.searchPaginator.allResults.push( searchResults.slice(pageIndex, pageIndex + sliceEnd) );
            pageIndex = pageIndex + sliceEnd;

        }

        this.updateSearchResultsPagination();

        console.log(this.searchPaginator);
    }

    updateSearchResultsPagination()
    {
        this.searchResults = this.searchPaginator.allResults[this.searchPaginator.currentIndex];
        this.searchPaginator.currentPageIsFirst = (this.searchPaginator.currentIndex === 0);
        this.searchPaginator.currentPageIsLast = (this.searchPaginator.currentIndex === (this.searchPaginator.allResults.length - 1));
        
        let totalMatches = this.searchPaginator.totalResults;
        if(this.searchPaginator.currentPageIsLast === true && this.searchPaginator.currentPageIsFirst === false)
        {
            let startResults = (this.searchPaginator.currentIndex * maxResults) + 1;
            this.searchMessage = 'Displaying ' + startResults + '-' + (startResults + this.searchResults.length -1) + ' out of ' + totalMatches + ' total matching results.';
        }
        else 
        {
            let startResults = (this.searchPaginator.currentIndex * maxResults) + 1;
            this.searchMessage = 'Displaying ' + startResults + '-' + (startResults + this.searchResults.length -1) + ' out of ' + totalMatches + ' total matching results.';
        }
    }

    handlePaginationNext() {

        if(this.searchPaginator.currentPageIsLast === false)
        {
            this.searchPaginator.currentIndex = this.searchPaginator.currentIndex + 1;
            this.updateSearchResultsPagination();
            console.log(generalUtils.cloneObjectWithJSON(this.searchPaginator));
        }

    }

    handlePaginationPrevious() {

        if(this.searchPaginator.currentPageIsFirst === false)
        {
            this.searchPaginator.currentIndex = (this.searchPaginator.currentIndex - 1);
            this.updateSearchResultsPagination();
            console.log(generalUtils.cloneObjectWithJSON(this.searchPaginator));
        }

    }

    handleSelectIcon(e) {
        
        let currId = e?.target?.dataset?.id;
        currId = (generalUtils.isStringEmpty(currId) === false) ? currId :  e?.currentTarget?.dataset?.id;
        this.selectedIconName = undefined;
        if(generalUtils.isStringEmpty(currId) === false)
        {
            let currType = '';
            let currStyle = '';
            for(let i=0;i<this.iconDictionary.length;i++)
            {
                this.iconDictionary[i].isSelected = (this.iconDictionary[i].id === currId);
                this.iconDictionary[i].classes = (this.iconDictionary[i].isSelected) ? classesSelected : classesNotSelected;
                currType = (this.iconDictionary[i].isSelected === true) ? this.iconDictionary[i].type: currType;
                currStyle = (this.iconDictionary[i].isSelected === true) ? this.iconDictionary[i].style: currStyle;
            }

            for(let i=0;i<this.searchResults.length;i++)
            {
                this.searchResults[i].isSelected = (this.searchResults[i].id === currId);
                this.searchResults[i].classes = (this.searchResults[i].isSelected) ? classesSelected : classesNotSelected;
            }
            this.selectedIconName = currId;
            this.selectedIconType = currType;
            this.selectedIconStyle = currStyle;
            this.propInputs.chooseIconButton.buttonLabel = 'Update Icon';
        }

    }

    handleSaveIcon(e) {
        
        this.saveError = undefined;
        if(generalUtils.isStringEmpty(this.selectedIconName) === false)
        {
            this.propInputs.iconName.value = this.selectedIconName;
            this.propInputs.iconType.value = this.selectedIconType;
            this.propInputs.iconStyle.value = this.selectedIconStyle;
            let tmpvalueObj = this.getValueObj();
            tmpvalueObj.iconName = this.selectedIconName;
            tmpvalueObj.iconType = this.selectedIconType;
            tmpvalueObj.iconStyle = this.selectedIconStyle;

            this.dispatchEvent(new CustomEvent("valuechange", 
                {detail: {value: JSON.stringify(tmpvalueObj)}}));
            this.handleCloseModal();
        }
        else
        {
            this.saveError = 'No Icon Selected';
        }

    }

    displayInputErrorByDataKey(identifier, text)
    {
        displayLightningInputError(this, '[data-key="'+identifier+'"]', text);
    }

    handleDataBindedIconNameChange(e) {

        window.clearTimeout(this.propInputs.dataBindedIconName.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.dataBindedIconName.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('dataBindedIconName', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    
                    this.propInputs.dataBindedIconName.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.dataBindedIconName = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('dataBindedIconName', 'Invalid value provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('dataBindedIconName', 'Invalid value provided.');
            }

        }, typeDelay);
        
    }

    handleIconSizeChange(e) {

        window.clearTimeout(this.propInputs.iconSize.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSize.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSize', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSize.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconSize = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSize', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSize', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconSizeTabletChange(e) {

        window.clearTimeout(this.propInputs.iconSizeTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSizeTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSizeTablet', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSizeTablet.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconSizeTablet = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSizeTablet', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSizeTablet', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconSizeMobileChange(e) {

        window.clearTimeout(this.propInputs.iconSizeMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconSizeMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconSizeMobile', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconSizeMobile.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconSizeMobile = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconSizeMobile', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconSizeMobile', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconColorChange(e) {
        
        let inputvalue = e.detail.value;
        this.propInputs.iconColor.value = inputvalue;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.iconColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleBackgroundColorChange(e) {
        
        let inputvalue = e.detail.value;
        this.propInputs.backgroundColor.value = inputvalue;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.backgroundColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }
    
    handleBorderSizeChange(e) {

        window.clearTimeout(this.propInputs.borderSize.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.borderSize.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('borderSize', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.borderSize.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.borderSize = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('borderSize', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('borderSize', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleBorderColorChange(e) {
        
        let inputvalue = e.detail.value;
        this.propInputs.borderColor.value = inputvalue;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.borderColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleIconShapeChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.iconShape.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.iconShape = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleIconPaddingChange(e) {

        window.clearTimeout(this.propInputs.iconPadding.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPadding.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPadding', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPadding.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPadding = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPadding', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPadding', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconPaddingTabletChange(e) {

        window.clearTimeout(this.propInputs.iconPaddingTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPaddingTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPaddingTablet', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPaddingTablet.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPaddingTablet = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPaddingTablet', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPaddingTablet', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconPaddingMobileChange(e) {

        window.clearTimeout(this.propInputs.iconPaddingMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPaddingMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPaddingMobile', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPaddingMobile.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPaddingMobile = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPaddingMobile', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPaddingMobile', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconPaddingVerticalChange(e) {

        window.clearTimeout(this.propInputs.iconPaddingVertical.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPaddingVertical.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPaddingVertical', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPaddingVertical.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPaddingVertical = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPaddingVertical', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPaddingVertical', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconPaddingVerticalTabletChange(e) {

        window.clearTimeout(this.propInputs.iconPaddingVerticalTablet.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPaddingVerticalTablet.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPaddingVerticalTablet', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPaddingVerticalTablet.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPaddingVerticalTablet = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPaddingVerticalTablet', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPaddingVerticalTablet', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconPaddingVerticalMobileChange(e) {

        window.clearTimeout(this.propInputs.iconPaddingVerticalMobile.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.iconPaddingVerticalMobile.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('iconPaddingVerticalMobile', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.iconPaddingVerticalMobile.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.iconPaddingVerticalMobile = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('iconPaddingVerticalMobile', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('iconPaddingVerticalMobile', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleIconAlignmentChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.iconAlignment.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.iconAlignment = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleIconAlignmentTabletChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.iconAlignmentTablet.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.iconAlignmentTablet = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleIconAlignmentMobileChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.iconAlignmentMobile.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.iconAlignmentMobile = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleStrokeSizeChange(e) {

        window.clearTimeout(this.propInputs.strokeSize.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.strokeSize.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('strokeSize', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    inputvalue = parseInt(inputvalue);
                    this.propInputs.strokeSize.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.strokeSize = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('strokeSize', 'Invalid number provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('strokeSize', 'Invalid number provided.');
            }

        }, typeDelay);
        
    }

    handleStrokeColorChange(e) {
        
        let inputvalue = e.detail.value;
        this.propInputs.strokeColor.value = inputvalue;
        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.strokeColor = inputvalue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleCopyToClipboard(e) {

       this.doTextCopy(copyToClipboardText);

    }

    handleCopyToClipboardAura(e) {
        let text = copyToClipboardText;
        text = text.replaceAll('{ basePath }','').replaceAll('?{ versionKey }','');
        this.doTextCopy(text);
 
     }


    doTextCopy(text) {
        if(generalUtils.isStringEmpty(text) === false)
        {
            navigator.clipboard.writeText(text);
            const evt = new ShowToastEvent({
                title: 'Copied to Clipboard',
                message: ' ',
                variant: 'success',
              });
              this.dispatchEvent(evt);
        }
    }

}