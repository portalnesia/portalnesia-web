import React from 'react'
import {CircularProgress} from '@mui/material'
import { useTheme,styled } from '@mui/material/styles';
import {replaceAt,splice} from '@portalnesia/utils'
import classNames from 'classnames'


export const uChord =(text,func,html)=>{
    let hasChord= /(\b)(([A-G]((#?|b?|\d?)(\d?))?((sus|maj|min|aug|dim|add|m)(\d?))?)((?!\w)))((((\/)[A-G](#?|b?)?)?((sus|maj|min|aug|dim|add|m))?([A-G](#?|b?)?)?(\d?))|(\-{1,1}\d|\-\S+))?(\.+)?/g;
    //let hasChord= /(\b)(([A-G]((#?|b?|\d?)(\d?))?((sus|maj|min|aug|dim|add|m)(\d?))?)((?!\w)))((((\/)[A-G](#?|b?)?)?((sus|maj|min|aug|dim|add|m))?([A-G](#?|b?)?)?(\d?))|(\-\d))?(\.+)?/g;
    let buffer=[];
    let pisah=text.split("\n");
    let spasi=(html===true)?"<br>":"\n";
    let sudah=[];
    let aa=0;
    while(aa < pisah.length) {
        let line=pisah[aa],linenum=aa,mat = line.match(hasChord);
        if(line.match(/^\#/)) {
            buffer.push("{c:"+line.slice(1)+"}");
        }
        if(mat) {
            let hasil=pisah[linenum+1],p=0,k,ind=0;
            if(typeof hasil !== 'undefined' && hasil.match(hasChord) || typeof hasil === 'undefined' || typeof hasil !== 'undefined' && hasil.length < 1) {
                hasil=line;
                mat.forEach(function(ch,i){
                    let li=hasil;
                    //var n = line.indexOf(ch,ind); //0 2 6 8 | D F#m E G   | 0, 0
                    k = (i===0)?0:p+ind+1; // 0, 4, 10, 14 [D] [F#m] [E] [G] 0,4,9,12
                    p = p + 2; // 2, 4, 6 | [D] F#m E G | [B] [F#m] E  G | [D] [F#m] [E] [G]
                    ind=(i===0)?ch.length+ind:ch.length+ind+1; // 1,5,7
                    var ha = replaceAt(hasil,k,"["+ch+"] ");
                    hasil=ha;
                });
                buffer.push(hasil);
            } else if(typeof hasil !== 'undefined' && !hasil.match(hasChord) && hasil.length > 0) {
                mat.forEach(function(ch,i){
                    let li=hasil;
                    var n = line.indexOf(ch,ind); //0 2 6 8 | D F#m E G   | 0, 0
                    k = p+n; // 0, 5, 11 [B]ke[C]man[D]a
                    p=p+ ch.length + 2; // 3, 6, 9
                    ind=n+1;
                    //ind=(i===0)?ch.length+ind:ch.length+ind+2; // 1,5,7
                    var ha = splice(li,k,0,"["+ch+"]");
                    //console.log("n "+ch,n);
                    //console.log("k "+ch,k);
                    //console.log("p "+ch,p);
                    //console.log("ind "+ch,ind);
                    hasil=ha;
                });
                sudah.push(linenum+1);
                buffer.push(hasil);
            } else {
                buffer.push(line);
            }
        } else {
            if(sudah.indexOf(aa) == -1) {
                buffer.push(line);
            }
        }
        //if(line.length < 1) buffer.push("");
        aa++;
    }
    if(typeof func==='function') {
        return func(buffer.join(spasi));
    }
    return buffer.join(spasi);
};

const Div = styled('div')(({theme})=>({
    whiteSpace:'nowrap',
    fontFamily:'monospace !important',
    lineHeight:1.5,
    '& .chord':{
        fontWeight:700,
        color:theme.custom.link
    },
    '& .margin': {
        marginBottom:5
    },
    '& .comment':{
        display:'block'
    },
    '& .command_block':{
        margin:'.5px'
    },
    '& .line':{
        WebkitColumnBreakInside:'avoid',
        pageBreakInside:'avoid',
        breakInside:'avoid-column'
    }
}))

const Kchord=function(template, transpose,margin,func) {
    if( typeof transpose == "undefined" ) {
        transpose = false;
    }
    const chordregex= /\[([^\]]*)\]/;
    const inword    = /[a-z]$/;
    const buffer    = [];
    const chords    = [];
    let last_was_lyric = false;
    let chord;
    const transpose_chord = function( chord, trans ) {
        var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        var regex = /([A-Z][b#]?)/g;
        var modulo = function(n, m) {
                return ((n % m) + m) % m;
        };
        return chord.replace( regex, function( $1 ) {
            if( $1.length > 1 && $1[1] == 'b' ) {
                if( $1[0] == 'A' ) {
                    $1 = "G#";
                } else {
                    $1 = String.fromCharCode($1[0].charCodeAt() - 1) + '#';
                }
            }
            var index = notes.indexOf( $1 );
            if( index != -1 ) {
                index = modulo( ( index + trans ), notes.length );
                return notes[index];
            }
            return chord;
        });
    };
    if (!template || template.length===0) {
        if(typeof func==='function') return func("");
        return "";
    }

    template.split("\n").forEach(function(line, linenum) {
        /* Comment, ignore */
        if (line.match(/^#/)) {
            return "";
        }
        /* Chord line */
        if (line.match(chordregex)) {
            if( !buffer.length ) {
                buffer.push('<div class="lyric_block">');
                last_was_lyric = true;
            } else if( !last_was_lyric ) {
                buffer.push('</div><div class="lyric_block">');
                last_was_lyric = true;
            }
            let chords = "";
            let lyrics = "";
            let chordlen = 0;
            line.split(chordregex).forEach(function(word, pos) {
                var dash = 0;
                /* Lyrics */
                if ((pos % 2) == 0) {
                    lyrics = lyrics + word.replace(' ', "&nbsp;");
                  /*
                   * Whether or not to add a dash (within a word)
                   */
                    if (word.match(inword)) {
                        dash = 1;
                    }
                  /*
                   * Apply padding.  We never want two chords directly adjacent,
                   * so unconditionally add an extra space.
                   */
                    if (word && word.length < chordlen) {
                        chords = chords + "&nbsp;";
                        lyrics = (dash == 1) ? lyrics + "&nbsp;" : lyrics + "&nbsp&nbsp;";
                        for (var i = chordlen - word.length - dash; i != 0; i--) {
                            lyrics = lyrics + "&nbsp;";
                        }
                    } else if (word && word.length == chordlen) {
                        chords = chords + "&nbsp;";
                        lyrics = (dash == 1) ? lyrics + " " : lyrics + "&nbsp;";
                    } else if (word && word.length > chordlen) {
                        for (var i = word.length - chordlen; i != 0; i--) {
                            chords = chords + "&nbsp;";
                        }
                    }
                } else {
                    /* Chords */
                    chord = word.replace(/[[]]/, "");
                    if(transpose !== false) {
                        chord = transpose_chord(chord, transpose);
                    }
                    chordlen = chord.length;
                    chords = chords + '<span class="chord" data-original-val="' + chord + '">' + chord + '</span>';
                }
            }, this);
            var cek=lyrics.match(/(?!nbsp\b)\b\w+/); //Cek ada lirik *null= tidak ada
            if( cek === null){
                buffer.push('<span class="line">' + chords + "</span><br/>");
            } else {
                buffer.push('<span class="line">' + chords + "<br/>\n" + lyrics + "</span><br/>");
            }
            return;
        }
        /* Commands, ignored for now */
        if (line.match(/^{.*}/)) {
            if( !buffer.length ) {
                buffer.push('<div class="command_block">');
                last_was_lyric = false;
            } else if( last_was_lyric ) {
                buffer.push('</div><div class="command_block">');
                last_was_lyric = false;
            }
            //ADD COMMAND PARSING HERE
            //reference: http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm
            // implement basic formatted text commands
            var matches = line.match(/^{(title|t|subtitle|st|comment|c|#):\s*(.*)}/, "i");
            if( matches.length >= 3 ) {
                var command = matches[1];
                var text = matches[2];
                var wrap="";
                //add more non-wrapping commands with this switch
                switch( command ) {
                    case "title":
                    case "t":
                        command = "";
                        wrap = "h1";
                        break;
                    case "subtitle":
                    case "st":
                        command = "";
                        wrap = "h4";
                        break;
                    case "comment":
                    case "c":
                        command = classNames('comment',margin ? 'margin' : '');
                        wrap    = "em";
                        break;
                    case "#":
                        command = '';
                        wrap = 'h6';
                        text="#"+text;
                        break;
                }
                if( wrap ) {
                    if(wrap==='em') {
                        buffer.push('<' + wrap + ' class="' + command + '">[' + text + ']</' + wrap + '>' );
                    } else {
                        buffer.push('<' + wrap + ' class="' + command + '">' + text + '</' + wrap + '>' );
                    }
                }
            }
            // work from here to add wrapping commands
            return;
        }
        /* Anything else */
        buffer.push(line + "<br/>");
    }, this);
    if(typeof func==='function') {
        return func(buffer.join("\n"));
    }
    return buffer.join("\n");
};

const Chord=({template,transpose,margin,...other})=>{
    const theme=useTheme();
    const data = React.useMemo(()=>Kchord(template.replace(/&amp;/g, "\&"),transpose,margin),[template,transpose,theme])

    return(
        <>
        {data ? (
            <Div dangerouslySetInnerHTML={{__html:data}} {...other} />
        ) : (
            <div style={{margin:'20px auto',textAlign:'center'}}>
                <CircularProgress thickness={5} size={50}/>
            </div>
        )}
        </>
    )
}
Chord.defaultProps={
    transpose:0,
    template:'',
    margin:true
}
export default Chord;