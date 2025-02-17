//<!-- startup status timeout if auto status is checked at start of pages-->



sks = {}
sks.consts = {

    yes: 0,
    no: 1,

    shutter: function() {
        var x =  $('#shutterSelect');
        return x;

    },
    ISO: function() {
        var x = $('#ISOSelect');
        return x;
    },
    frame: function() {
        var x = $('#frameSelect');
        return x;
    },
    format: function() {
        var x = $('#formatSelect');
        return x;
    },
    saveObs: function() {
        var x = $('#saveObs');
        return x;
    },
    fieldWidthModeaPP: function() {
        var x = $('#FieldWidthModeaPP');
        return x;
    },
    FieldWidthaPPLow: function() {

        var x = $('#FieldWidthaPPLow');
        console.log("low app field", x)
        return x;
    },
    FieldWidthaPPHi: function() {
        var x = $('#FieldWidthaPPHi');
        return x;
    }, 
    FieldWidthModeField: function() {
        var x = $('#FieldWidthModeField');
        return x;
    },

    fieldLoValue: function() {
        var x = $('#fieldLoValue');
        return x;
    },
    fieldHiValue: function() {
        var x = $('#fieldHiValue');
        return x;
    },
    FieldWidthModeOther: function() {
        var x = $('#FieldWidthModeOther');
        return x;
    },
    CPUtimeout: function() {
        var x = $('#CPUtimeout');
        return x;
    },
    additionalParms: function() {
        var x = $('#additionalParms');
        return x;
    },
    SolveDepth: function() {
        var x = $('#SolveDepth');
        console.log("depth part", x)
        return x;
    },
    SolveSigma: function() {
        var x = $('#SolveSigma');
        return x;
    },
    searchRadius: function() {
        var x = $('#searchRadius');
        return x;
    },


    solveVerbose: function() {
        var x = $('#solveVerbose');
        return x;
    },
    showStars: function() {
        var x = $('#showStars');
        return x;
    },

    demoMode: false,
    showHistory: 0,
    showSolution: 0,
    profiles : {"a": 1, "b":2},
    currentProfile: ''
};

function refreshImage(){
    $.post("/retryImage")
}
function setSolverParams(  cur){
    sks.consts.currentProfile = cur;
    console.log('cur profile',cur)
    console.log("const.profiles",cur, JSON.stringify(sks.consts.profiles[cur]));
    sks.consts.showStars()[0].checked =sks.consts.profiles[cur]["showStars"];
    sks.consts.SolveDepth().val(sks.consts.profiles[cur]['solveDepth'])
    sks.consts.SolveSigma().val(sks.consts.profiles[cur]['solveSigma'])
    sks.consts.FieldWidthaPPLow().val(sks.consts.profiles[cur]['aPPLoValue'])
    sks.consts.FieldWidthaPPHi().val(sks.consts.profiles[cur]['aPPHiValue'])
    sks.consts.CPUtimeout().val(sks.consts.profiles[cur]['maxTime'])
    sks.consts.solveVerbose()[0].checked = sks.consts.profiles[cur]['solveVerbose']
    sks.consts.searchRadius().val(sks.consts.profiles[cur]['searchRadius'])
    sks.consts.additionalParms().val(sks.consts.profiles[cur]['additionalParms'])
    sks.consts.fieldHiValue().val(sks.consts.profiles[cur]['fieldHiValue'])
    sks.consts.fieldLoValue().val(sks.consts.profiles[cur]['fieldHiValue'])
    var mode = sks.consts.profiles[sks.consts.currentProfile]['FieldWidthMode']
    var yyy = $('#' + mode)
    yyy.prop('checked', true);
}

function setProfiles(profiles){
    var x = JSON.parse(profiles)
    sks.consts.profiles = x;

}
function setIniShutter( shutVal){
    console.log("shutter value", shutVal)
    sks.consts.shutter().val(shutVal);
}
function setIniISO( ISOVal){
    console.log("ISO val", ISOVal)
    sks.consts.ISO().val(ISOVal);
}
function setIniFrame( frameVal){
    sks.consts.frame().val(frameVal);
}
function setIniFormat(formatVal){
    sks.consts.format().val(formatVal);
}


$(document).ready(function(){

    $('#solverParamsForm').submit(function(){

        $.ajax({
          url: $('#solverParamsForm').attr('action'),
          type: 'POST',
          data : $('#solverParamsForm').serialize(),
          success: function(data){
            console.log('form submitted.', data);
            setProfiles(data)
          }
        });
        return false;
    });

    var checkBox = document.getElementById("autoStatusCB");
    console.log("checkBox", checkBox)
    if (checkBox.checked == true) {
        setTimeout(updateStatusField, 1000);
    }

    var cb = document.getElementById('showStars')
    var btn = document.getElementById('ShowStars')
    if (cb.checked == false){
        btn.disabled = true
    }
    // event hookups/subscribes
    sks.consts.shutter().change(
        function() {
            let x = sks.consts.shutter().val();
            $.post("/setShutter/" + x, data = {
                suggest: x
            }, function(result) {});
    });

    sks.consts.ISO().change(
        function() {

            let x = sks.consts.ISO().val();
            console.log("ISO is being set", x);
            $.post("/setISO/" + x, data = {
                suggest: x
            }, function(result) {});
    });

    sks.consts.frame().change(
        function() {
            console.log("frame size change");
            let x = sks.consts.frame().val();
            $.post("/setFrame/" + x, data = {
                suggest: x
            }, function(result) {});
    });

    sks.consts.format().change(
        function() {
            let x = sks.consts.format().val();
            $.post("/setFormat/" + x, data = {
                suggest: x
            }, function(result) {});
    });

    sks.consts.saveObs().change(
        function() {
            let x = sks.consts.saveObs().val();
            $.post("/saveObs/" + x, data = {
                suggest:x
            }, function(result) {});            
    });

    function ajax_get_Status(cmdroute) {
        $.ajax({
            url: cmdroute,
            method: 'POST',
            success: function(result) {
                document.getElementById("statusField").innerHTML = result;
            }
        });
    }
    $('#solveProfile').change(
        function() {
            console.log("this", this.value)
            sks.consts.currentProfile = this.value;
            setSolverParams(this.value);
        }
    )
    $('#addToProfiles').click(
        function() {
            console.log("new profile add clicked")
            // get reference to select element
            var sel = document.getElementById('solveProfile');

            // create new option element
            var opt = document.createElement('option');
            // create text node to add to option element (opt)
            var newName = $('#newProfilename').val()
            console.log("new name", newName)
            opt.appendChild( document.createTextNode(newName) );

            // set value property of opt
            opt.value = newName; 

            // add opt to end of select box (sel)
            sel.appendChild(opt); 
            $('#solveProfile').val(newName);

            console.log("new profile",$('#solverParamsForm').serialize() )

            $.ajax({
                url: $('#solverParamsForm').attr('action'),
                type: 'POST',
                data : $('#solverParamsForm').serialize(),
                success: function(data){
                  console.log('form submitted.', data);
                  setProfiles(data)
                }
            })

        }
    )
    $('#deleteProfile').click(
        function(){
            var sel = $('#solveProfile').val()
            console.log("deleting ", sel)
            $.post("/deleteProfile/" + sel, data = {
                suggest: sel
            }, function(data) {
                setProfiles(data)
                var x = document.getElementById("solveProfile");
                console.log("seletor", x);
                console.log("select this", x.selectedIndex)
                x.remove(x.selectedIndex);
                console.log('selections',x)
            });
            
        }
    )
    $('#stepNext').click(
        function() {
            ajax_get_Status('/nextImage')
            setTimeout( refreshImage,300);
        })

    $('#retryNext').click(
        function() {
            ajax_get_Status('/retryImage')
        })

    $('#idPause').click (
        function() {
            ajax_get_Status('/pause')
        })
    $('#idAlign').click (
        function() {
            ajax_get_Status('/Align')
        })
    $('#idSolve').click (
        function() {
            ajax_get_Status('/Solve')
        })

    function ajax_get_Obs(cmdroute) {
        $.ajax({
            url: cmdroute,
            method: 'POST',
            success: function(result) {
                console.log("result",result);
                var txt = document.getElementById("currentObs");
                txt.value = result
            }
        });
    }
    function showReplaybuttons(show){
        var x = document.getElementById("stepNext");
        var y = document.getElementById("stepPrev");
        var z = document.getElementById("solveThis");

        if (show) {
            x.style.display = "inline";
            y.style.display = "inline";
            z.style.display = "inline";

        }  else {
            x.style.display = "none";
            y.style.display = "none";
            z.style.display = "none";

        }              
    }

    $('#startObs').click(
        function() {
            console.log("start obs");
            ajax_get_Obs('/startObs')
        })

    $('#nextObs').click(
        function() {
            ajax_get_Obs('/nextObs')
        })

    $('#prevObs').click(
        function() {
            ajax_get_Obs('/prevObs')
        })

    $('#stepPrev').click(
        function() {
            ajax_get_Obs('/prevImage')
            setTimeout( refreshImage,300);
        })

    $('#clearObsLog').click(
        function() {
            ajax_get_Status('/clearObsLog')
        })
    

    $('#solveThis').click(
        function() {
            console.log("imageStep pressed")
            ajax_get_Status('/solveThis')
        })
    $('#clearImages').click(
        function(){
            ajax_get_Status('/clearImages')
        }
    )
    
    $('#demoMode').click(
        function(){
            if (sks.consts.demoMode) {
                showReplaybuttons(false);
                sks.consts.demoMode = false;

            }
            else {
                ajax_get_Status('/demoMode');
                showReplaybuttons(true);
                sks.consts.demoMode=true;
                setTimeout( refreshImage,399);
            }
        }
    )
    
    $('#testMode').click(
        function() {
            
            if (!sks.consts.demoMode)
                ajax_get_Status('/testMode');
                setTimeout( refreshImage,1000);
            var x = document.getElementById("stepNext");
            if (x.style.display === "none") {
                showReplaybuttons(true);
            }                   
            else {
                showReplaybuttons(false);
            }
        })
    $('#showStars').click(

            function() {
                var cb = document.getElementById('showStars')
                var btn = document.getElementById('ShowStars')

                if (cb.checked == false) {
                    btn.disabled = true

                }
                else {
                    btn.disabled = false

                }
            }
        )
    $('#ClearLog').click(
        function(){
            console.log("check changed")
            var btn = document.getElementById('ShowStars')
            btn.disabled = true
            var text = document.getElementById('solveStatusText');
            text.innerHTML = "";
        }
    )
    $('#showSolutionCB').click(
        function() {

            var checkBox = document.getElementById("showSolutionCB");
            if (checkBox.checked == true) {
                sks.consts.showSolution = 1;
            }
            else {
                sks.consts.showSolution = 0;
            }
            let x = sks.consts.showSolution;

            $.post("/showSolution/" + x, data = {
                suggest: x
            }, function(result) {});
        }
    ) 
    $('#saveImages').click(
        function() {

            var checkBox = document.getElementById("saveImages");
            if (checkBox.checked == true) {
                sks.consts.showSolution = 1;
            }
            else {
                sks.consts.showSolution = 0;
            }
            let x = sks.consts.showSolution;

            $.post("/saveImages/" + x, data = {
                suggest: x
            }, function(result) {});
        }
    ) 


});



