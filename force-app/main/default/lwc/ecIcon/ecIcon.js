/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import dir from '@salesforce/i18n/dir';
import { LightningElement, api, track } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString as normalize } from 'c/utilsPrivate';
import * as iconUtils from 'c/iconUtils';
import standardTemplate from './ecIcon.html';
import { getIconSvgTemplates } from 'lightning/configProvider';
import generalUtils from 'c/gtaUtilsGeneral';
import * as deviceUtils from 'c/gtaUtilsDevice';

const resPath = '/sfsites/c/resource/';


export default class ecIcon extends LightningElement {

    @track resourcesList = [
        {
            identifer: resPath + 'ecicon__fontawesome/css/brands.min.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/brands.min.css?{ versionKey }" />',
            key: 'stylesFaBrands'
        },
        {
            identifer: resPath + 'ecicon__fontawesome/css/regular.min.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/regular.min.css?{ versionKey }" />',
            key: 'stylesFaRegular'
        },
        {
            identifer: resPath + 'ecicon__fontawesome/css/solid.min.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/solid.min.css?{ versionKey }" />',
            key: 'stylesFaSolid'
        },
        {
            identifer: resPath + 'ecicon__fontawesome/css/fontawesome.min.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/css/fontawesome.min.css?{ versionKey }" />',
            key: 'stylesFa'
        },
        {
            identifer: resPath + 'ecicon__googlefontsoutlined/css/MaterialSymbolsOutlined.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsoutlined/css/MaterialSymbolsOutlined.css?{ versionKey }" />',
            key: 'stylesGfOutlined'
        },
        {
            identifer: resPath + 'ecicon__googlefontsrounded/css/MaterialSymbolsRounded.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsrounded/css/MaterialSymbolsRounded.css?{ versionKey }" />',
            key: 'stylesGfRounded'
        },
        {
            identifer: resPath + 'ecicon__googlefontssharp/css/MaterialSymbolsSharp.css',
            isLoaded: false,
            isStyle: true,
            headScript: '<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/ecicon__googlefontssharp/css/MaterialSymbolsSharp.css?{ versionKey }" />',
            key: 'stylesGfSharp'
        },

        {
            identifer: resPath + 'ecicon__fontawesome/webfonts/fa-brands-400.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-brands-400.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsFaBrands'
        },
        {
            identifer: resPath + 'ecicon__fontawesome/webfonts/fa-regular-400.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-regular-400.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsFaRegular'
        },
        {
            identifer: resPath + 'ecicon__fontawesome/webfonts/fa-solid-900.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__fontawesome/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsFaSolid'
        },
        {
            identifer: resPath + 'ecicon__googlefontsoutlined/webfonts/MaterialSymbolsOutlined.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsoutlined/webfonts/MaterialSymbolsOutlined.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsGfOutlined'
        },
        {
            identifer: resPath + 'ecicon__googlefontsrounded/webfonts/MaterialSymbolsRounded.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontsrounded/webfonts/MaterialSymbolsRounded.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsGfRounded'
        },
        {
            identifer: resPath + 'ecicon__googlefontssharp/webfonts/MaterialSymbolsSharp.woff2',
            isLoaded: false,
            isStyle: false,
            headScript: '<link rel="preload" href="{ basePath }/sfsites/c/resource/ecicon__googlefontssharp/webfonts/MaterialSymbolsSharp.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchPriority="low"/>',
            key: 'fontsGfSharp'
        }
    ];

    @api configJSONString = '{}';

    get configObj() {
        return JSON.parse(this.configJSONString);
    }

    get computedIconName() {

        if(generalUtils.isStringEmpty(this.iconName) === false)
        {
            if(generalUtils.isStringEmpty(this.computedIconType) === false && (this.computedIconType === 'fa' || this.computedIconType === 'gf'))
            {
                let tmpvalue = this.iconName.split(':')[1];
                return tmpvalue;
            }
            return this.iconName;
        }

        if(generalUtils.isStringEmpty(this.dataBindedIconName) === false)
        {
            let tmpvalue = this.dataBindedIconName;
            if(this.computedIconType === 'fa' || this.computedIconType === 'gf')
            {
                tmpvalue = tmpvalue.split(':')[1];
            }
            return tmpvalue;
        }

        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconName) || this.configObj?.iconName.trim() === 'undefined') 
        ? '' : this.configObj?.iconName;

        if(generalUtils.isStringEmpty(this.computedIconType) === false && (this.computedIconType === 'fa' || this.computedIconType === 'gf'))
        {
            tmpvalue = tmpvalue.split(':')[1];
        }

        return tmpvalue;
    }

    get dataBindedIconName() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.dataBindedIconName) || this.configObj?.dataBindedIconName.trim() === 'undefined') 
        ? '' : this.configObj?.dataBindedIconName;
        return tmpvalue;
    }

    get computedIconType() {

        if(generalUtils.isStringEmpty(this.iconType) === false)
        {
            return this.iconType;
        }

        if(generalUtils.isStringEmpty(this.dataBindedIconName) === false)
        {

            let tmpStyle = this.dataBindedIconName.split(':')[0];
            let tmpType = 'slds';
            if(['solid','regular','brands'].includes(tmpStyle))
            {
                tmpType = 'fa';
            }
            else  if(['outlined','rounded','sharp'].includes(tmpStyle))
            {
                tmpType = 'gf';
            }
            return tmpType;
        }
    

        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconType) || this.configObj?.iconType.trim() === 'undefined') 
        ? '' : this.configObj?.iconType;

        return tmpvalue;
    }

    get computedIconStyle() {

        if(generalUtils.isStringEmpty(this.iconStyle) === false)
        {
            return this.iconStyle;
        }

        if(generalUtils.isStringEmpty(this.dataBindedIconName) === false)
        {

            let tmpStyle = this.dataBindedIconName.split(':')[0];
            return tmpStyle;
        }

        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconStyle) || this.configObj?.iconStyle.trim() === 'undefined') 
        ? '' : this.configObj?.iconStyle;

        return tmpvalue;
    }

    get computedIconSize() {

        if(generalUtils.isObjectEmpty(this.iconSize) === false)
        {
            return this.iconSize;
        }

        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconSize)) 
        ? '' : this.configObj?.iconSize;

        if(deviceUtils.getFormFactor() === 'Medium')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconSizeTablet)) 
                ? tmpvalue : this.configObj?.iconSizeTablet;
        }
        else if(deviceUtils.getFormFactor() === 'Small')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconSizeMobile)) 
                ? tmpvalue : this.configObj?.iconSizeMobile;
        }

        return tmpvalue;
    }

    get iconColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconColor)) 
        ? '' : this.configObj?.iconColor;
        return tmpvalue;
    }

    get backgroundColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.backgroundColor)) 
        ? '' : this.configObj?.backgroundColor;
        return tmpvalue;
    }

    get borderSize() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.borderSize)) 
        ? '' : this.configObj?.borderSize;
        return tmpvalue;
    }

    get borderColor() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.borderColor)) 
        ? '' : this.configObj?.borderColor;
        return tmpvalue;
    }

    get iconShape() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconShape)) 
        ? '' : this.configObj?.iconShape;
        return tmpvalue;
    }

    get iconPadding() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPadding)) 
        ? '20' : this.configObj?.iconPadding;

        if(deviceUtils.getFormFactor() === 'Medium')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPaddingTablet)) 
                ? tmpvalue : this.configObj?.iconPaddingTablet;
        }
        else if(deviceUtils.getFormFactor() === 'Small')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPaddingMobile)) 
                ? tmpvalue : this.configObj?.iconPaddingMobile;
        }

        return tmpvalue;
    }

    get iconPaddingVertical() {
        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPaddingVertical)) 
        ? '5' : this.configObj?.iconPaddingVertical;

        if(deviceUtils.getFormFactor() === 'Medium')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPaddingVerticalTablet)) 
                ? tmpvalue : this.configObj?.iconPaddingVerticalTablet;
        }
        else if(deviceUtils.getFormFactor() === 'Small')
        {
            tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.iconPaddingVerticalMobile)) 
                ? tmpvalue : this.configObj?.iconPaddingVerticalMobile;
        }

        return tmpvalue;
    }

    get iconAlignment() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconAlignment)) 
        ? '' : this.configObj?.iconAlignment;

        if(deviceUtils.getFormFactor() === 'Medium')
        {
            tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconAlignmentTablet)) 
                ? tmpvalue : this.configObj?.iconAlignmentTablet;
        }
        else if(deviceUtils.getFormFactor() === 'Small')
        {
            tmpvalue = (generalUtils.isStringEmpty(this.configObj?.iconAlignmentMobile)) 
                ? tmpvalue : this.configObj?.iconAlignmentMobile;
        }

        return tmpvalue;
    }

    get computedStrokeSize() {

        if(generalUtils.isObjectEmpty(this.strokeSize) === false)
        {
            return this.strokeSize;
        }

        let tmpvalue = (generalUtils.isObjectEmpty(this.configObj?.strokeSize)) 
        ? '' : this.configObj?.strokeSize;
        return tmpvalue;
    }

    get computedStrokeColor() {

        if(generalUtils.isObjectEmpty(this.strokeColor) === false)
        {
            return this.strokeColor;
        }

        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.strokeColor)) 
        ? '' : this.configObj?.strokeColor;
        return tmpvalue;
    }

    get showResourcesError() {
        return this.isInSitePreview() === true && this.resourcesNotLoaded === true && this.isCpe === false;
    }

    get stylesNotLoaded() {
        let stylesNotLoaded = false;
        if(this.showResourcesError === true)
        {
            let notLoadedStylesArray = this.resourcesList.filter((item) => item.isLoaded === false && item.isStyle === true);
            stylesNotLoaded = generalUtils.isArrayEmpty(notLoadedStylesArray) === false;
        }
        return stylesNotLoaded;
    }

    get fontsNotLoaded() {
        let fontsNotLoaded = false;
        if(this.showResourcesError === true)
        {
            let notLoadedFontsArray = this.resourcesList.filter((item) => item.isLoaded === false && item.isStyle === false);
            fontsNotLoaded = generalUtils.isArrayEmpty(notLoadedFontsArray) === false;
        }
        return fontsNotLoaded;
    }

    @api iconName;
    @api iconSize;
    @api iconType; //slds, fa, gf
    @api iconStyle; //utility, action, standard, custom, doctype, solid, brands, regular, outlined, rounded, sharp
    @api isCpe = false;
    @api strokeSize;
    @api strokeColor;
    resourcesNotLoaded = false;
    fontsCssHeader = '<!-- ecicon fonts -->';
    stylesCssHeader = '<!-- ecicon stylesheets -->';
    src;
    svgClass;
    size = 'medium';
    variant;
    noTransform = false;
    focusable = false;


    privateIconSvgTemplates = getIconSvgTemplates();

    get inlineSvgProvided() {
        return !!this.privateIconSvgTemplates;
    }

    connectedCallback() {
        
        this.resourcesNotLoaded = this.checkResourcesLoaded() === false;
        
    }

    renderedCallback() {
        if (this.computedIconName !== this.prevIconName && !this.inlineSvgProvided) {
            this.prevIconName = this.computedIconName;
            const svgElement = this.template.querySelector('svg');
            iconUtils.polyfill(svgElement);
        }

        let eciconWrapper = this.template.querySelector('.eciconWrapper');

        if (generalUtils.isObjectEmpty(eciconWrapper) === false)
        {
            
            if(generalUtils.isObjectEmpty(this.computedIconSize) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-icon-size', this.computedIconSize + 'px');
            }

            if(generalUtils.isStringEmpty(this.iconColor) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-icon-color', this.iconColor);
            }

            if(generalUtils.isStringEmpty(this.backgroundColor) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-background-color', this.backgroundColor);
            }

            if(generalUtils.isObjectEmpty(this.borderSize) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-border-size', this.borderSize + 'px');
            }

            if(generalUtils.isStringEmpty(this.borderColor) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-border-color', this.borderColor);
            }

            if(generalUtils.isStringEmpty(this.iconShape) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-border-radius', (this.iconShape === 'circle') ? '50%' : '0px' );
            }

            if(generalUtils.isObjectEmpty(this.computedStrokeSize) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-icon-stroke-size', this.computedStrokeSize + 'px');
            }

            if(generalUtils.isStringEmpty(this.computedStrokeColor) === false)
            {
                eciconWrapper.style.setProperty('--ecicon-icon-stroke-color', this.computedStrokeColor);
            }

            
            eciconWrapper.style.setProperty('--ecicon-icon-padding', this.iconPaddingVertical + 'px ' + this.iconPadding + 'px ' + this.iconPaddingVertical + 'px ' + this.iconPadding + 'px');
            eciconWrapper.style.setProperty('--ecicon-icon-padding-vertical', this.iconPaddingVertical + 'px ');

        }
        

    }

    isInSitePreview() {
        let domain = document.URL.split('?')[0].replace('https://','').split('/')[0];
        return (domain.includes('.sitepreview.')  
            || domain.includes('.livepreview.') 
            || domain.includes('.live-preview.')  
            || domain.includes('.live.') 
            || domain.includes('.builder.') 
            );
    }

    get isSitePreview() {
        return this.isInSitePreview();
    }

    isAura() {
        return generalUtils.isObjectEmpty( document.querySelector('body > webruntime-app') ) === true;
    }

    get ecIconWrapperClasses() {
        let classes = [];
        classes.push('eciconWrapper');
        if(this.isInSitePreview() === true && (this.isIconFa === true || this.isIconGf === true))
        {
            classes.push('ecIconWrapperVerticalSpace');
        }
        return classes.join(' ');
    }

    get faWrapperClasses() {
        let classes = [];
        if(this.iconAlignment === 'left')
        {
            classes.push('slds-text-align_left');
        }
        else if(this.iconAlignment === 'right')
        {
            classes.push('slds-text-align_right');
        }
        else 
        {
            classes.push('slds-text-align_center');
        }
        return classes.join(' ');
    }

    get svgWrapperClasses() {
        let classes = [];
        classes.push('svgWrapper');
        if(this.iconAlignment === 'left')
        {
            classes.push('svgAlignLeft');
        }
        else if(this.iconAlignment === 'right')
        {
            classes.push('svgAlignRight');
        }
        else 
        {
            classes.push('svgAlignLeft');
            classes.push('svgAlignRight');
        }
        return classes.join(' ');
        
    }

    get isIconFa()
    {
        return this.computedIconType === 'fa';
    }

    get isIconGf()
    {
        return this.computedIconType === 'gf';
    }
    
    get href() {
        let tmphref = this.src || iconUtils.getIconPath(this.computedIconName, dir);
        if(this.computedIconType === 'slds')
        {
            let sldsCategory = this.computedIconName.split(':')[0];
            if(['standard','custom','utility','action','doctype'].includes(sldsCategory))
            {
                let sldsName = this.computedIconName.split(':')[1];
                let basePath = '/' + tmphref.substring(1).split('/')[0];
                basePath = (this.isInSitePreview() === true && this.isAura() === true) ? '' : basePath ;
                basePath = basePath.replaceAll('//','/');
                tmphref = basePath + '/sfsites/c/resource/ecicon__sldsicons/' + sldsCategory + '.svg#' + sldsName;
            }
        }
        return tmphref;
    }

    get name() {
        return iconUtils.getName(this.computedIconName);
    }

    get normalizedSize() {
        return normalize(this.size, {
            fallbackValue: 'medium',
            validValues: ['xx-small', 'x-small', 'small', 'medium', 'large']
        });
    }

    get normalizedVariant() {
        return normalize(this.variant, {
            fallbackValue: '',
            validValues: ['bare', 'error', 'inverse', 'warning', 'success']
        });
    }

    get computedClass() {
        const { normalizedSize, normalizedVariant } = this;
        const classes = classSet(this.svgClass);

        if(this.isIconFa === true)
        {
            classes.add('faIcon');
        }

        if(this.isIconGf === true)
            {
                classes.add('gfIcon');
                classes.add('material-symbols-' + this.computedIconStyle);
            }

        if (normalizedVariant !== 'bare') {
            classes.add('slds-icon');
        }

        switch (normalizedVariant) {
            case 'error':
                classes.add('slds-icon-text-error');
                break;
            case 'warning':
                classes.add('slds-icon-text-warning');
                break;
            case 'success':
                classes.add('slds-icon-text-success');
                break;
            case 'inverse':
            case 'bare':
                break;
            default:
                if (!this.src) {
                    classes.add('slds-icon-text-default');
                }
        }

        if (normalizedSize !== 'medium') {
            classes.add(`slds-icon_${normalizedSize}`);
        }

        if(this.noTransform)
        {
            classes.add('no-transform');
        }

        return classes.toString();
    }

    resolveTemplate() {
        const name = this.computedIconName;
        if (iconUtils.isValidName(name)) {
            const [spriteName, iconName] = name.split(':');
            const template = this.privateIconSvgTemplates[
                `${spriteName}_${iconName}`
            ];

            if (template) {
                return template;
            }
        }
        
        return standardTemplate;
    }

    render() {
        if (this.inlineSvgProvided) {
            return this.resolveTemplate();
        }
        return standardTemplate;
    }

    checkResourcesLoaded() {
        
        for(let i =0; i<this.resourcesList.length; i++)
        {
            let isAura = this.isAura();
            if(isAura === true)
            {
                this.resourcesList[i].headScript = this.resourcesList[i].headScript.replace('{ basePath }','');
                this.resourcesList[i].headScript = this.resourcesList[i].headScript.replace('?{ versionKey }','');
            }
            this.resourcesList[i].isLoaded = this.isResourceLoaded(this.resourcesList[i].identifer);
        }

        let resourcesNotLoaded = this.resourcesList.filter(item => item.isLoaded === false);
        return generalUtils.isArrayEmpty(resourcesNotLoaded) === true;

    }

    isResourceLoaded(identifier) {
        let resource = document.head.querySelectorAll('link[href*="' + identifier + '"]');
        return generalUtils.isArrayEmpty(resource) === false;
    }

}