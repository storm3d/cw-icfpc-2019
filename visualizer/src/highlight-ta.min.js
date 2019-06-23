var hlghtta=function(b,t,re,c){"use strict";var ta,cntr,tComp,cComp,crnrs,modT,modB,radT,radB,brdrT,brdrB,brdrL,brdrR,padT,padB,padL,padR,tare,scrlL,scrlT,cPadT,cPadL,regs,regexes;function noCrnrs(){if(crnrs){ta.style.borderTopRightRadius="";ta.style.borderBottomRightRadius="";}}
function sharpCrnrs(){if(crnrs){if(modT){ta.style.borderTopRightRadius="0px";}
if(modB){ta.style.borderBottomRightRadius="0px";}}}
function scrollbar(){if(ta.clientHeight!==ta.scrollHeight){if(ta.style.overflowY!=="scroll"){sharpCrnrs();ta.style.overflowY="scroll";}}else if(ta.style.overflowY==="scroll"){noCrnrs();ta.style.overflowY="hidden";}}
function removeHTML(t){t=t.replace(/&/g,'&amp');t=t.replace(/</g,'&lt');t=t.replace(/>/g,'&gt');return t;}
function newLines(t){t=t.replace(/\n$/g,'<br><br>');return t;}
function highlight(txt){if(regexes){var i=0;while(i<regexes.length){regexes[i].div.innerHTML=regexes[i].regexp(txt);cntr.appendChild(regexes[i].div);i+=1;}}}
function filter(){var txt=ta.value;txt=removeHTML(txt);txt=newLines(txt);return txt;}
function onInput(){var txt=filter(ta.value);highlight(txt);size();}
function onScroll(){var i=0;while(i<regexes.length){regexes[i].div.scrollTop=ta.scrollTop;i+=1;}}
function size(){scrlL=window.pageXOffset;scrlT=window.pageYOffset;if(ta.scrollHeight<=ta.clientHeight){ta.style.height="auto";}
ta.style.height=ta.scrollHeight+tare+"px";scrollbar();if(regexes){var i=0;while(i<regexes.length){updateDiv(regexes[i].div);i+=1;}}
window.scrollTo(scrlL,scrlT);}
function onResize(){noCrnrs();getTare();styleTa();styleCntr();if(regexes){var i=0;while(i<regexes.length){updateDiv(regexes[i].div);styleDiv(regexes[i].div);simpleStyle(regexes[i].div);i+=1;}}
if(ta.style.overflowY==="scroll"){sharpCrnrs();}
size();}
function addEvnts(){ta.addEventListener("input",onInput,false);ta.addEventListener("scroll",onScroll,false);window.addEventListener("resize",onResize,false);}
function rmvEvnts(){ta.removeEventListener("input",size,false);ta.removeEventListener("scroll",onScroll,false);window.removeEventListener("resize",onResize,false);}
function fixNan(a){if(isNaN(a)){return 0;}
return a;}
function setTare(){brdrT=parseFloat(tComp.getPropertyValue("border-top-width"));brdrB=parseFloat(tComp.getPropertyValue("border-bottom-width"));brdrL=parseFloat(tComp.getPropertyValue("border-left-width"));brdrR=parseFloat(tComp.getPropertyValue("border-right-width"));padT=parseFloat(tComp.getPropertyValue("padding-top"));padB=parseFloat(tComp.getPropertyValue("padding-bottom"));padL=parseFloat(tComp.getPropertyValue("padding-left"));padR=parseFloat(tComp.getPropertyValue("padding-right"));brdrT=fixNan(brdrT);brdrB=fixNan(brdrB);brdrL=fixNan(brdrL);brdrR=fixNan(brdrR);padT=fixNan(padT);padB=fixNan(padB);padL=fixNan(padL);padR=fixNan(padR);}
function setCntrTare(){cPadT=parseFloat(cComp.getPropertyValue("padding-top"));cPadL=parseFloat(cComp.getPropertyValue("padding-left"));cPadT=fixNan(cPadT);cPadL=fixNan(cPadL);}
function setCrnrs(){radT=parseFloat(tComp.getPropertyValue("border-top-right-radius"));radB=parseFloat(tComp.getPropertyValue("border-bottom-right-radius"));radT=fixNan(radT);radB=fixNan(radB);modT=(brdrT<radT)?true:false;modB=(brdrB<radB)?true:false;}
function getTare(){setTare();setCntrTare();setCrnrs();if(tComp.getPropertyValue("box-sizing")==="border-box"){tare=brdrT+brdrB;}else{tare=(padT+padB)*-1;}}
function modCrnrs(b){if(typeof b==="boolean"){if(!b){noCrnrs();crnrs=b;}else{crnrs=b;sharpCrnrs();}}}
function styleTa(){ta.style.overflow="hidden";ta.style.overflowX="hidden";ta.style.overflowY="hidden";ta.style.position="relative";ta.style.background="none";ta.style.backgroundColor="transparent";ta.style.zIndex="1";}
function styleCntr(){if(cntr.style.position!=="absolute"||cntr.style.position!=="relative"||cntr.style.position!=="fixed"){cntr.style.position="relative";}}
function simpleStyle(n){n.style.position="absolute";n.style.whiteSpace="pre-line";n.style.overflow="hidden";n.style.overflowX="hidden";n.style.overflowY="hidden";n.style.paddingTop="0px";n.style.paddingRight="0px";n.style.paddingBottom="0px";n.style.paddingLeft="0px";n.style.marginTop="0px";n.style.marginRight="0px";n.style.marginBottom="0px";n.style.marginLeft="0px";n.style.color="transparent";n.style.border="none";n.style.boxSizing="border-box";n.style.backgroundColor="transparent";}
function styleDiv(n){n.style.boxSizing=tComp.getPropertyValue("box-sizing");n.style.fontStyle=tComp.getPropertyValue("font-style");n.style.fontSize=tComp.getPropertyValue("font-size");n.style.fontVariant=tComp.getPropertyValue("font-variant");n.style.fontWeight=tComp.getPropertyValue("font-weight");n.style.lineHeight=tComp.getPropertyValue("line-height");n.style.wordWrap=tComp.getPropertyValue("word-wrap");n.style.marginTop=tComp.getPropertyValue("margin-top");n.style.marginLeft=tComp.getPropertyValue("margin-left");}
function updateDiv(n){n.style.top=(cPadT+brdrT+padT)+"px";n.style.left=(cPadL+brdrL+padL)+"px";n.style.height=(ta.clientHeight-padL-padR)+"px";n.style.width=(ta.clientWidth-padT-padB)+"px";}
function unstyle(n){n.style.position="";n.style.width="";n.style.minHeight="";n.style.maxHeight="";n.style.height="";n.style.overflow="";n.style.overflowX="";n.style.overflowY="";n.style.wordWrap="";n.style.whiteSpace="";}
function wrapFunc(f){return function(t){try{t=f(t);}catch(e){console.log(e);}finally{return t;}};}
function makeMark(m){m="<mark class=\""+m+"\" style=\"color: transparent\">$&</mark>";return m;}
function makeRegex(r,m){return function(t){t=t.replace(r,m);return t;};}
function addRegex(r){var d=document.createElement("DIV");regexes.push({"div":d,"regexp":r});}
function removeChilds(){var c=cntr.childNodes;var i=c.length-1;var found=false;while(i>-1){if(!found&&c[i].tagName==='TEXTAREA'){found=true;i-=1;continue;}
cntr.removeChild(c[i]);i-=1;}}
function removeDivs(){if(cntr){var cn=cntr.childNodes;var i=cn.length-1;while(i!==-1){if(cn[i].tagName==="DIV"){cntr.removeChild(cn[i]);}
i-=1;}}}
function setRegexes(r){regs=r!==undefined?r:regs;regexes=[];removeDivs();if(regs instanceof Object){var keys=Object.keys(r);keys=keys.sort();for(var rule in keys){var k=regs[keys[rule]];if(k instanceof Object){var p,m;if(k.function){addRegex(wrapFunc(k.function));continue;}
m=k.css!==undefined?makeMark(k.css):makeMark("");p=k.pattern instanceof RegExp?k.pattern:p;p=typeof k.pattern==="string"?new RegExp(k.pattern,"g"):p;if(p instanceof RegExp){addRegex(makeRegex(p,m));}}}}}
function cleanUp(){if(ta!==undefined){unstyle(ta);noCrnrs();rmvEvnts();tComp=undefined;crnrs=undefined;ta=undefined;}
if(cntr!==undefined){removeDivs();unstyle(cntr);cntr=undefined;}
regs=undefined;regexes=undefined;}
function setup(b,t,re,c){if(!t||!b){return;}
cleanUp();if(t.tagName==="TEXTAREA"){ta=t;tComp=window.getComputedStyle(ta);modCrnrs(true);modCrnrs(c);rmvEvnts();addEvnts();styleTa();}
if(re){setRegexes(re);}
if(b.tagName==="DIV"||b.tagName==="SECTION"){cntr=b;cComp=window.getComputedStyle(cntr);removeChilds();styleCntr();onResize();onInput();}}
setup(b,t,re,c);return{init:function(b,t,re,c){setup(b,t,re,c);},setCorners:function(c){modCrnrs(c);},setHighlights:function(re){setRegexes(re);onInput();onResize();},update:function(){onInput();onResize();},destroy:function(){cleanUp();}};};
