window.lformsUpdater=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=6)}([function(e,t,r){"use strict";function n(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e))){var t=0,r=function(){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,i,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}e.exports={isFHIRResource:function(e){return!!e.resourceType},findExtensions:function(e,t){e.extension&&t(e.extension);var r=e.item||e.items;if(r){var o,i=n(r);try{for(i.s();!(o=i.n()).done;){var a=o.value;this.findExtensions(a,t)}}catch(e){i.e(e)}finally{i.f()}}},findItemByExtension:function(e,t){e.extension&&t(e);var r=e.item||e.items;if(r){var o,i=n(r);try{for(i.s();!(o=i.n()).done;){var a=o.value;this.findItemByExtension(a,t)}}catch(e){i.e(e)}finally{i.f()}}},versionLessThan:function(e,t){var r;if(e){for(var n=e.split("."),o=t.split("."),i=0;i<3&&void 0===r;++i){var a=parseInt(n[i]),u=parseInt(o[i]);a!=u&&(r=a<u)}void 0===r&&(r=!1)}else r=!0;return r},makeVersionTag:function(e){return"lformsVersion: "+e},versionFromTag:function(e){var t=null,r=(e.code||e.display).match(/^lformsVersion: (.+)$/);return r&&(t=r[1]),t}}},function(e,t,r){"use strict";function n(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e))){var t=0,r=function(){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,i,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}for(var i=["25.0.0","24.0.0","23.0.0","22.0.0"],a={},u=0,f=i;u<f.length;u++){var s=f[u];a[s]=r(7)("./"+s)}e.exports={update:function(e,t){var o,u=t,f=r(0),s=f.isFHIRResource(e);if(s){var l=e.meta;if(l){var c=l.tag;if(c){var d,y=n(c);try{for(y.s();!(d=y.n()).done;){var v=d.value,m=f.versionFromTag(v);if(m){o=m;break}}}catch(e){y.e(e)}finally{y.f()}}}}else o=e.lformsVersion;for(var p,h=[],b=0,g=i.length;b<g&&(p=i[b])&&f.versionLessThan(o,p);++b)u&&f.versionLessThan(u,p)||h.push(p);var I,S=h[0],x=n(h.reverse());try{for(x.s();!(I=x.n()).done;){var A=I.value;e=a[A](e)}}catch(e){x.e(e)}finally{x.f()}if(h.length)if(s){var w=e.meta;w||(w=e.meta={});var j,T=w.tag;T||(T=w.tag=[]);var C,k=n(T);try{for(k.s();!(C=k.n()).done;){var _=C.value;if(f.versionFromTag(_)){j=_;break}}}catch(e){k.e(e)}finally{k.f()}var O=f.makeVersionTag(S);j?(j.code=O,delete j.display):T.push({code:O})}else e.lformsVersion=S;return e}}},function(e,t,r){"use strict";function n(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e))){var t=0,r=function(){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,i,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}e.exports=function(e){var t=r(0);return t.isFHIRResource(e)&&"Questionnaire"!==e.resourceType||t.findExtensions(e,(function(e){var t,r=n(e);try{for(r.s();!(t=r.n()).done;){var o=t.value;"http://hl7.org/fhir/StructureDefinition/questionnaire-observationLinkPeriod"===o.url&&(o.url="http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationLinkPeriod")}}catch(e){r.e(e)}finally{r.f()}})),e}},function(e,t,r){"use strict";function n(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e))){var t=0,r=function(){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,i,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}e.exports=function(e){var t=r(0),o=e.meta;if(o){var i=o.tag;if(i){var a,u=n(i);try{for(u.s();!(a=u.n()).done;){var f=a.value;if(t.versionFromTag(f)){f.display&&!f.code&&(f.code=f.display,delete f.display);break}}}catch(e){u.e(e)}finally{u.f()}}}return"Questionnaire"===e.resourceType&&t.findItemByExtension(e,(function(e){if(e.extension)for(var t=0;t<e.extension.length;t++){"http://hl7.org/fhir/StructureDefinition/questionnaire-answerRepeats"===e.extension[t].url&&(e.repeats=!0,e.extension.splice(t,1),t-=1)}})),e}},function(e,t,r){"use strict";function n(e){!function e(t,r,n){for(var o=t.length,i=null,a=0;a<o;a++){var u=t[a];u.questionCardinality&&u.questionCardinality.max&&("*"===u.questionCardinality.max||parseInt(u.questionCardinality.max)>1)&&i&&i.questionCode===u.questionCode?1:1;var f=r+"/"+u.questionCode;u._parentItem=n,u._codePath=f,u.linkId||(u.linkId=f),i=u,u.items&&u.items.length>0&&e(u.items,f,u)}}(e.items,"",e),function e(t){for(var r=0,n=t.length;r<n;r++){var i=t[r];if(i.skipLogic&&i.skipLogic.conditions)for(var a=0,u=i.skipLogic.conditions.length;a<u;a++){var f=i.skipLogic.conditions[a],s=o(i,f.source);f.source=s.linkId}if(i.dataControl)for(a=0,u=i.dataControl.length;a<u;a++){var l=i.dataControl[a].source;if(l&&(!l.sourceType||"INTERNAL"===l.sourceType)&&l.sourceItemCode){if(!(s=o(i,l.sourceItemCode)))throw new Error("Data control for item '"+i.question+"' refers to source item '"+l.sourceItemCode+"' which was not found as a sibling, ancestor, or ancestor sibling.");l.sourceLinkId=s.linkId,delete l.sourceItemCode}}if(i.calculationMethod&&i.calculationMethod.value&&Array.isArray(i.calculationMethod.value)){var c=[];for(a=0,u=i.calculationMethod.value.length;a<u;a++){var d=i.calculationMethod.value[a];s=o(i,d);c.push(s.linkId)}i.calculationMethod.value=c}i.items&&i.items.length>0&&e(i.items)}}(e.items),function e(t){for(var r=0,n=t.length;r<n;r++){var o=t[r];delete o._parentItem,delete o._codePath,o.items&&o.items.length>0&&e(o.items)}}(e.items)}function o(e,t){var r=null;if(e._parentItem&&Array.isArray(e._parentItem.items))for(var n=0,o=e._parentItem.items.length;n<o;n++)if(e._parentItem.items[n].questionCode===t){r=e._parentItem.items[n];break}if(!r)for(var i=e._parentItem;i;){var a=!1;if(i.questionCode===t)r=i,a=!0;else if(i._parentItem&&Array.isArray(i._parentItem.items)){var u=i._parentItem.items;for(n=0,o=u.length;n<o;n++)if(u[n].questionCode===t){r=u[n],a=!0;break}}if(a)break;i=i._parentItem}return r}e.exports=function(e){return!r(0).isFHIRResource(e)&&e.items&&n(e),e}},function(e,t,r){"use strict";function n(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}(e))){var t=0,r=function(){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,i,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}e.exports=function(e){var t=r(0);return t.isFHIRResource(e)&&"Questionnaire"!==e.resourceType||t.findExtensions(e,(function(e){var t,r=n(e);try{for(r.s();!(t=r.n()).done;){var o=t.value;"http://hl7.org/fhir/StructureDefinition/questionnaire-calculatedExpression"===o.url&&(o.url="http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression")}}catch(e){r.e(e)}finally{r.f()}})),e}},function(e,t,r){e.exports=r(1)},function(e,t,r){var n={"./":1,"./22.0.0":2,"./22.0.0.js":2,"./23.0.0":3,"./23.0.0.js":3,"./24.0.0":4,"./24.0.0.js":4,"./25.0.0":5,"./25.0.0.js":5,"./index":1,"./index.js":1,"./util":0,"./util.js":0};function o(e){var t=i(e);return r(t)}function i(e){if(!r.o(n,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return n[e]}o.keys=function(){return Object.keys(n)},o.resolve=i,e.exports=o,o.id=7}]);
//# sourceMappingURL=updater.js.map