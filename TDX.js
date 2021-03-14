var TDX = {
  canvas:null,
  ctx:null,
  fontType:null,
  fontSize:14,
  fontModifiers:null,
  fontColor:"#000000",
  posShifts:[],
  shiftSpeed:0.3,
  init:function(canvas) {
  	this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  },
  font:function(face,size,modifiers=[]) {
  	this.fontType = face;
    this.fontSize = size;
    this.fontModifiers = modifiers;
    var modString = "";
    for(var i=0;i<this.fontModifiers.length;i++) {
    	modString += this.fontModifiers[i] + " ";
    }
    this.ctx.font = modString+this.fontSize+"px "+this.fontType;
  },
  replaceAt:function(index,text,replacement) {
  	return text.substr(0,index)+replacement+text.substr(index+replacement.length);
  },
  fillText:function(text,x,y,maxwidth=4096,lineHeight=this.fontSize) {
  	var words = text.split(" ");
    var lines = [];
    var testLines = [];
    var currentLine = "";
    var testCurrentLine = "";
    var modifiers = [];
    var altmodifiers = [];
    var getPosShift = 0;
    var curCountShift = 0;
    var color = this.fontColor;
    for(var i=0;i<words.length;i++) {
    	var word = words[i];
      var tempword = word;
      var newline = false;
      for(var k=0;k<tempword.length;k++) {
      	if(tempword.charAt(k) == "/") {
        	if(k+1<tempword.length && tempword.charAt(k+1) == "n") {
          	tempword = tempword.slice(0,k)+tempword.slice(k+2);
            k-=2;
            newline = true;
          } else if(k+1<tempword.length && tempword.charAt(k+1) == "c") {
          	tempword = tempword.slice(0,k)+tempword.slice(k+8);
            k-=8;
          } else {
          	tempword = tempword.slice(0,k)+tempword.slice(k+2);
            k-=2;
          }
        }
      }
      var width = this.ctx.measureText(testCurrentLine+" "+tempword).width;
      if(width<maxwidth && !newline) {
      	if(i==0) { currentLine += word; testCurrentLine += tempword; }
        else { currentLine += " "+word; testCurrentLine += " "+tempword; }
      } else {
      	lines.push(currentLine);
        testLines.push(testCurrentLine);
        currentLine = word;
        testCurrentLine = tempword;
      }
    }
    lines.push(currentLine);
    var xoffset = 0;
    var nsum = 0;
    var skip = 0;
    for(var i=0;i<lines.length;i++) {
    	var lwords = lines[i].split(" ");
      for(var k=0;k<lwords.length;k++) {
      	var lastLetter = 1;
      	var npos = 0;
        var l = lwords[k].length;
      	for(var j=0;j<l;j++) {
        	var dispskip = false;
        	if(lwords[k].charAt(j) == "/" && j+1<lwords[k].length && skip<=0) {
          	//console.log(lwords[k].charAt(j)+lwords[k].charAt(j+1));
          	//lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
            //l--;
            if(lwords[k].charAt(j+1) == "/") {
            	skip = 1;
              dispskip = true;
              lastLetter += 1;
            }
            if(lwords[k].charAt(j+1) == "n") {
            	skip = 2;
              lastLetter += 2;
            }
            if(lwords[k].charAt(j+1) == "b") {
            	modifiers.includes("bold") ? modifiers.splice(modifiers.indexOf("bold"),1) : modifiers.push("bold");
              skip = 2;
              lastLetter += 2;
              //lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
              //j--;
            } else if(lwords[k].charAt(j+1) == "i") {
            	modifiers.includes("italic") ? modifiers.splice(modifiers.indexOf("italic"),1) : modifiers.push("italic");
              skip = 2;
              lastLetter += 2;
              //lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
              //j--;
            } else if(lwords[k].charAt(j+1) == "o") {
            	modifiers.includes("oblique") ? modifiers.splice(modifiers.indexOf("oblique"),1) : modifiers.push("oblique");
              skip = 2;
              lastLetter += 2;
            } else if(lwords[k].charAt(j+1) == "u") {
            	altmodifiers.includes("underline") ? altmodifiers.splice(altmodifiers.indexOf("underline"),1) : altmodifiers.push("underline");
              skip = 2;
              lastLetter += 2;
            } else if(lwords[k].charAt(j+1) == "c") {
            	color = "#"+lwords[k].slice(j+2,j+8);
              //lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+7);
              skip = 8;
              lastLetter += 8;
              //j--;
            } else if(lwords[k].charAt(j+1) == "x") {
            	getPosShift == 2 ? getPosShift = 0 : getPosShift = 2;
              skip = 2;
              lastLetter += 2;
            	//lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
              //j--;
            } else if(lwords[k].charAt(j+1) == "y") {
            	getPosShift == 1 ? getPosShift = 0 : getPosShift = 1;
              skip = 2;
              lastLetter += 2;
            	//lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
              //j--;
            } else if(lwords[k].charAt(j+1) == "w") {
            	if(getPosShift == 3) { getPosShift = 0; curCountShift = 0; } else getPosShift = 3;
              skip = 2;
              lastLetter += 2;
              //lwords[k] = lwords[k].slice(0,j)+lwords[k].slice(j+1);
              //j--;
            } else if(lwords[k].charAt(j+1) == "v") {
            	if(getPosShift == 4) { getPosShift = 0; curCountShift = 0; } else getPosShift = 4;
              skip = 2;
              lastLetter += 2;
            }
          }
          
          if(getPosShift == 1 && this.posShifts.filter(function(shift) {return (shift.text == text && shift.line == i && shift.word == k && shift.letter == j)}).length==0) this.posShifts.push({text:text,line:i,word:k,letter:j,x:0,y:0,vx:0,vy:-6,count:0,type:1,shiftSpeed:this.shiftSpeed});
          if(getPosShift == 2 && this.posShifts.filter(function(shift) {return (shift.text == text && shift.line == i && shift.word == k && shift.letter == j)}).length==0) this.posShifts.push({text:text,line:i,word:k,letter:j,x:0,y:0,vx:-2,vy:0,count:0,type:2,shiftSpeed:this.shiftSpeed});
          if(getPosShift == 3 && this.posShifts.filter(function(shift) {return (shift.text == text && shift.line == i && shift.word == k && shift.letter == j)}).length==0) {
            this.posShifts.push({text:text,line:i,word:k,letter:j,x:0,y:0,vx:0,vy:-6,count:curCountShift,type:3,shiftSpeed:this.shiftSpeed});
            curCountShift -= 0.9;
          }
          if(getPosShift == 4 && this.posShifts.filter(function(shift) {return (shift.text == text && shift.line == i && shift.word == k && shift.letter == j)}).length==0) {
          	this.posShifts.push({text:text,line:i,word:k,letter:j,x:0,y:0,vx:-2,vy:-2,count:0,type:4,shiftSpeed:this.shiftSpeed});
          }
        	var wordMetrics = {width:0};
        	if(j>0 && skip<=0) { wordMetrics = this.ctx.measureText(lwords[k].charAt(j-(lastLetter))); lastLetter = 1; }
          if(skip<=0 || dispskip) npos += wordMetrics.width;
          if(modifiers.length>0) {
          	var cmodString = "";
          	for(var n=0;n<modifiers.length;n++) {
    					cmodString += modifiers[n] + " ";
    				}
    				this.ctx.font = cmodString+this.fontSize+"px "+this.fontType;
          } else this.ctx.font = this.fontSize+"px "+this.fontType;
          
          if(skip<=0 || dispskip) nsum += this.ctx.measureText(lwords[k].charAt(j)).width;
          var xshift = 0, yshift = 0;
          var pShift = this.posShifts.filter(function(shift) {return (shift.text == text && shift.line == i && shift.word == k && shift.letter == j)});
          //console.log(pShift);
          if(altmodifiers.includes("underline")) {
          	var prevColor = this.ctx.fillStyle;
          	this.ctx.fillStyle = "#000000";
            if(j+1>lwords[k].length-1 && k!=lwords.length-1) var uwidth = this.fontSize;
            else var uwidth = this.ctx.measureText(lwords[k].charAt(j)).width;
            this.ctx.fillRect(x+xoffset+npos-1,y+i*lineHeight+3,uwidth+1,1);
            this.ctx.fillStyle = prevColor;
          }
          
          if(pShift.length>0) {
          	if(pShift[0].type == 1 || pShift[0].type == 3) {
              yshift = pShift[0].y;
              //pShift[0].y+=pShift[0].vy;
              pShift[0].y=4*Math.sin(0.4*pShift[0].count);
              pShift[0].count+=pShift[0].shiftSpeed;
            } else if(pShift[0].type == 2) {
            	xshift = pShift[0].x;
              //pShift[0].x+=pShift[0].vx;
              pShift[0].x=1.8*Math.sin(0.5*pShift[0].count);
              pShift[0].count+=pShift[0].shiftSpeed;
            } else if(pShift[0].type == 4) {
            	// Make better
            	xshift = pShift[0].x;
            	if(Math.random()>0.57) pShift[0].x=Math.floor(2*Math.random()-1);
              yshift = pShift[0].y;
            	if(Math.random()>0.57) pShift[0].y=Math.floor(2*Math.random()-1);
            }
          }
          if(skip<=0) {
          	this.ctx.fillStyle = color;
        		this.ctx.fillText(lwords[k].charAt(j),x+xoffset+npos+xshift,y+i*lineHeight+yshift);
          } else skip--;
        }
        xoffset += nsum + this.ctx.measureText(" ").width;
        nsum = 0;
      }
      xoffset = 0;
    }
  }
}
