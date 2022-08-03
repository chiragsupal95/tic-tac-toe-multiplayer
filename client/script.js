const url = window.location.origin;
let socket = io.connect(url);

var myTurn = true;
var symbol;

function getBoardStates() {
  var locationPlayed = {};

  $(".board input").each(function() {
    locationPlayed[$(this).attr("id")] = $(this).val() || "";
  });

  return locationPlayed;
}

function isGameOver() {
    var state = getBoardStates();
    var matches = ["XXX", "OOO"]; 

    var rows = [
      state.r0c0 + state.r0c1 + state.r0c2, 
      state.r1c0 + state.r1c1 + state.r1c2, 
      state.r2c0 + state.r2c1 + state.r2c2, 
      state.r0c0 + state.r1c0 + state.r2c0, 
      state.r0c1 + state.r1c1 + state.r2c1, 
      state.r0c2 + state.r1c2 + state.r2c2, 
      state.r0c0 + state.r1c1 + state.r2c2, 
      state.r0c2 + state.r1c1 + state.r2c0  
    ];

    
    for (var i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }
    return false;
}

function displayTurnMessage() {
    if (!myTurn) { 
        $("#message").text("Your opponent's turn");
        $("#message").css("color","red");
        $("#turn").text(symbol+" turn");
        $("#turn").css("color","red");
        $(".board input").attr("disabled", true);
    } else {
        $("#message").text("Your turn.");
        $("#message").css("color","blue");
        $("#turn").text(symbol+" turn");
        $("#turn").css("color","blue");
        $(".board input").removeAttr("disabled");
    }
}

function makeMove(e) {
    if (!myTurn) {
        return; 
    }

    if ($(this).text().length) {
        return; 
    }

    socket.emit("make.move", { 
        symbol: symbol,
        position: $(this).attr("id")
    });
}


socket.on("move.made", function(data) {
    $("#" + data.position).val(data.symbol);
    if(data.symbol === "X"){
        $("#" + data.position).css("color", "blue");
    }
    else{
        $("#" + data.position).css("color", "red");

    }

   
    myTurn = data.symbol !== symbol;

    if (!isGameOver()) { 
        displayTurnMessage();
    } else { 
        if (myTurn) {
            $("#message").text("You lost.");
            $("#message").css("color", "red");
            $("#turn").text("");
        } else {
            $("#message").text("You won!");
            $("#message").css("color", "green");
            $("#turn").text("");
        }

        $(".board input").attr("disabled", true); 
    }
});



socket.on("game.start", function(data) {
    symbol = data.symbol; 
    myTurn = symbol === "X"; 
    displayTurnMessage();
});

socket.on("opponent.left", function() {
    $("#message").text("Your opponent left the game.");
    $(".board input").attr("disabled", true);
});


$(function() {
  $(".board input").attr("disabled", true); 
  $(".board input").on("click", makeMove);
});
