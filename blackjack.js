var currentScene = 0 // 0 = splash; 1 = betScreen; 2 = gameScreen 3 = win; 4 = lose
var cardsOnTable = [] //creates array for player cards 
var dealersCards = [] //array for dealer cards
var money = 50; // varaible for money
var betAmount = 0; // bet amount var
var showSecondCard = false; // to flip dealer card from back to front
var drawResetButton = false; // shows play again button once hand is over
var cardSpeed = 5; // speed variable outside draw
var betPlace = false; // tracks when a bet has been placed to make win/lose scenes work

var playerBlackjack = false //var for each possible outcome
var dealerBlackjack = false
var playerWin = false
var playerLoss = false
var tie = false


var randomCard = function(){ //gets random card with an index to the deck array
  var cardIndex = floor(random(0,51))
  return cardIndex
}

for(j = 0; j < 2 ; j++){ //pushes two random cards to the arrays for player and dealer
  dealersCards.push(randomCard())
  cardsOnTable.push(randomCard())
}

var checkPlayerTotal = function(array){ //checks the total value of players card
  var total = 0;
  var aceCount = 0;
  for(var i = 0; i < array.length; i++){ // runs through vards in player array
    var cardValue;
    var card = deck[array[i]].value; //gets the value for the according index from deck array
    if (card === "Jack" || card === "Queen" || card === "King") { //checks value
      cardValue = 10;
     }
    else if(card === "Ace") {
      cardValue = 11; 
      aceCount += 1
    }
    else{
      cardValue = parseInt(card, 10); // values are all strings so parseInt makes them integers
    }   
    total += cardValue;
  }
  if (total > 21 && aceCount >= 1){ //accounts for aces if a player hits and goes over 
    total -= 10
    aceCount -= 1
  }
  return total // returns the total value
}

var checkDealerTotal = function() { //does same thing and checks dealer cards
  var total = 0;
  var aceCount = 0;
  for (var i = 0; i < dealersCards.length; i++) {
    var cardValue;
    var card = deck[dealersCards[i]].value;
    if (card === "Jack" || card === "Queen" || card === "King") {
      cardValue = 10;
    }
    else if (card === "Ace") {
      cardValue = 11; 
      aceCount += 1;
    }
    else {
      cardValue = parseInt(card, 10);
    }
    total += cardValue;
  }

  // Adjust for Aces if total exceeds 21
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  return total;
};

var splash = function () //draws splash screen and buttons
  {
    background(0, 0, 0)
    fill(161, 102, 47)
    ellipse(200,280,500,200)
    fill(65, 190, 83)
    ellipse(200,250,500,200)
    noStroke()
    rect(0,0,400,200)
    textSize(60)
    fill(0,0,0)
    text ("Black Jack", 50, 50)
    startGame.draw()
  }

var  gameSceneBet = function() //draws bet scene
  {
    background(0, 0, 0)
    fill(161, 102, 47)
    ellipse(200,280,500,200)
    fill(65, 190, 83)
    ellipse(200,250,500,200)
    noStroke()
    rect(0,0,400,200)
    textSize(30)
    fill(0,0,0)
    text ("Place Your Bets", 80, 120)
    textSize(20)
    text("$" + money, 320,25)
    
  }

var gameSceneChoice = function() //draws game scene
  {
    background(0, 0, 0)
    fill(161, 102, 47)
    ellipse(200,280,500,200)
    fill(65, 190, 83)
    ellipse(200,250,500,200)
    noStroke()
    rect(0,0,400,200)
    fill(0,0,0)
    text("$" + money, 320,25)
  }

var win = function() // draws win screen 
  {
    background(0, 0, 0)
    fill(161, 102, 47)
    ellipse(200,280,500,200)
    fill(65, 190, 83)
    ellipse(200,250,500,200)
    noStroke()
    rect(0,0,400,200)
    fill(0,0,0)
    textSize(50)
    text("You Win!",100,100)
    textSize(15)
    text("You reached $200",140,180)
    text("Restart the program to play again",95,200)
    image(getImage("avatars/cs-hopper-cool"),50,250,50,50)
    image(getImage("avatars/old-spice-man"),300,250,50,50)
    image(getImage("avatars/mr-pink"),180,250,50,50)
  }

var lose = function() //draws lose screen 
  {
    background(0, 0, 0)
    fill(161, 102, 47)
    ellipse(200,280,500,200)
    fill(65, 190, 83)
    ellipse(200,250,500,200)
    noStroke()
    rect(0,0,400,200)
    fill(0,0,0)
    textSize(50)
    fill(255,0,0)
    text("You Lost :(",75,100)
    textSize(15)
    fill(0,0,0)
    text("You ran out of money",130,180)
    text("Restart the program to try again",95,200)
    image(getImage("avatars/cs-hopper-cool"),50,250,50,50)
    image(getImage("avatars/old-spice-man"),300,250,50,50)
    image(getImage("avatars/mr-pink"),180,250,50,50)
  }

var cardPositions = [ // Creates an array of object with each object being a card position
  {x: 55, y: -100},  // Position for first card
  {x: 110, y: -100},   
  {x: 165, y: -100},
  {x: 220, y: -100},
  {x: 275, y: -100}
];
var dealerPositions = [ //creates array of objects for dealer card positions
  {x: 480, y: 50},
  {x: 535, y: 50},
  {x: 590, y: 50},
  {x: 645, y: 50},
  {x: 700, y: 50}
]



var draw = function (){ //draw function for all scenes 
  if (currentScene === 0){ //draws splash screen if scene 0
    splash()
    drawAvatarCR(280,310,50)
    drawAvatarRC(30,240,40)
    textSize(15)
    text("Ryan C", 100,300)
    text("Charlie R", 300,300)
  }
  else if (currentScene === 1) // draws bet scene 
  {
    gameSceneBet()
    ten.draw()
    twenty.draw()
    fifty.draw()
  }
  else if (currentScene === 2) //draws game scene 
  {
    gameSceneChoice()
    if (hit.visible) { //draws buttons, accounts to make sure they can't be clicked when it is not the scene they are on 
      hit.draw();
    }
    if (stand.visible){
      stand.draw();
    }
    for (var i = 0; i < cardsOnTable.length; i++) { //runs for loop through the array of cards that are being displayed
      if (cardPositions[i].y < 300) { //animates player cards down from top 
        cardPositions[i].y += cardSpeed;
      }
      deck[cardsOnTable[i]].drawCard(cardPositions[i].x, cardPositions[i].y); //draws card while its animating
    }
    for (var i = 0; i < dealersCards.length; i++) {
      if (i === 0 && dealerPositions[i].x > 100) {  // Animtes dealer cards in from sides
        dealerPositions[i].x -= cardSpeed;
      } 
      else if (i === 1 && dealerPositions[i].x > 155) { 
        dealerPositions[i].x -= cardSpeed;
      }
      else if (i === 2 && dealerPositions[i].x > 210) {
        dealerPositions[i].x -= cardSpeed;
      }
      else if (i === 3 && dealerPositions[i].x > 265) {
        dealerPositions[i].x -= cardSpeed;
      }
      
      if (i === 0 || showSecondCard) { //makes it so dealer card is shown face down until stand button is clicked
          deck[dealersCards[i]].drawCard(dealerPositions[i].x, dealerPositions[i].y); //draws card
      } else {
          var cardBackImage = "https://KaChow-4.github.io/back of card.png"; //draws back of card instead
          image(getImage(cardBackImage), dealerPositions[i].x, dealerPositions[i].y, 50, 73);
        }
  }
    if(drawResetButton === true) { //draws reset button and disables hit and stand
      reset.draw()
      stand.visible = false;
      hit.visible = false;
    }
    
    if (playerBlackjack || playerWin) { //texts out win or lose or tie depending on result
      text("Player wins", 150,225)
    }
    else if (dealerBlackjack || playerLoss) {
      text("Dealer wins", 150,225)
    }
    else if (tie) {
      text("It's a tie", 170, 225)
    }
if(drawResetButton === true){ //draws reset button if it hand is over 
      reset.draw()
    }
    if(money <= 0 && betPlaced === false) { //checks for if player has no money
      currentScene = 4 //calls lose     
    }
    else if(money >= 200 && betPlaced === false) {
      currentScene = 3 //calls win
    }
  }
      if (currentScene === 3) //draws win scene
    {
      win()
    }
    if (currentScene === 4) //draws lose scene
    {
      lose()
    }

    }


class Button {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 120;
    this.height = config.height || 50;
    this.label = config.label || "Click";
    this.visible = true; //added this to button class to disable buttons when not wanted 
    this.onClick = config.onClick || function () {};
  }

  draw() {
    fill(0, 234, 255);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(0, 0, 0);
    textSize(19);
    textAlign(LEFT, TOP);
    text(this.label, this.x + 10, this.y + this.height / 4);
  }

  isMouseInside() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    );
  }

  handleMouseClick() {
    if (this.isMouseInside()) {
      this.onClick();
    }
  }
}

var startGame = new Button({ //starts button changes scenes
  x: 140,
  y: 145,
  width: 120,
  label: "Start Game",
  onClick: function () {
    if (currentScene === 0)
    {
      currentScene = 1
    }
  },
});
var reset = new Button({ // creates restart button, resets all positions, clears arrays, and pushes new cards
  x: 135,
  y: 150,
  width: 120,
  label: "Play Again?",
  onClick: function () {
    currentScene = 1
    cardsOnTable = []
    dealersCards = []
    showSecondCard = false;
    reset.visible = false
    playerWin = false
    playerLoss = false
    tie = false
    for(j = 0; j < 2 ; j++){
  dealersCards.push(randomCard())
  cardsOnTable.push(randomCard())
}  
 cardPositions = [
      { x: 55, y: -100 },
      { x: 110, y: -100 },
      { x: 165, y: -100 },
      { x: 220, y: -100 },
      { x: 275, y: -100 }
    ];

    dealerPositions = [
      { x: 480, y: 50 },
      { x: 535, y: 50 },
      { x: 590, y: 50 },
      { x: 645, y: 50 },
      { x: 700, y: 50 }
    ];
    drawResetButton = false
  },
});

class Card{ //Creates a class to create an object for each card
  constructor(suit, value){
    this.suit = suit;
    this.value = value;
  }

  drawCard(x,y){ //retrieves image for each card
    var url = cardImages[this.suit][this.value];
    image(getImage(url),x,y,50,73) 
}
}
var suits = ["hearts","diamonds","spades","clubs"] //all possible suits
var values = ["2","3","4","5","6","7","8","9","10","Jack","Queen","King","Ace"] //all possible values
var deck = [] //creates deck array
var cardImages = { //creates object that holds all the images for each card
  hearts:{"2":"https://i.imgur.com/6Ip2BLr.png",
          "3":"https://i.imgur.com/QeNHG8l.png",
          "4":"https://i.imgur.com/JErPcgA.png",
          "5":"https://i.imgur.com/bLxuGT2.png",
          "6":"https://i.imgur.com/mYZuAlQ.png",
          "7":"https://i.imgur.com/v0QA902.png",
          "8":"https://i.imgur.com/Nep3Ila.png",
          "9":"https://i.imgur.com/ZeWOLic.png",
          "10":"https://i.imgur.com/ge138is.png",
          "Jack":"https://i.imgur.com/vEdP8jL.png",
          "Queen":"https://i.imgur.com/2eoz2Jj.png",
          "King":"https://i.imgur.com/s1BNplL.png",
          "Ace":"https://i.imgur.com/2eOXflD.png"
         },
  diamonds:{"2":"https://i.imgur.com/hgXpvYx.png",
            "3":"https://i.imgur.com/UxXDM6u.png",
            "4":"https://i.imgur.com/lk9EeXy.png",
            "5":"https://i.imgur.com/f84bcHu.png",
            "6":"https://i.imgur.com/555Ekvq.png",
            "7":"https://i.imgur.com/IMS9INl.png",
            "8":"https://i.imgur.com/CpSnCKf.png",
            "9":"https://i.imgur.com/W700XaC.png",
            "10":"https://i.imgur.com/tDkvjUK.png",
            "Jack":"https://i.imgur.com/aKMmsZp.png",
            "Queen":"https://i.imgur.com/i1vwbcm.png",
            "King":"https://i.imgur.com/ZjBXFwx.png",
            "Ace":"https://i.imgur.com/4ZtiZnE.png"
           },
  spades:{"2":"https://i.imgur.com/pLgcgDJ.png",
         "3":"https://i.imgur.com/FRy54Su.png",
         "4":"https://i.imgur.com/mkJrq8g.png",
         "5":"https://i.imgur.com/hHnLAtV.png",
         "6":"https://i.imgur.com/RxPT6Kf.png",
         "7":"https://i.imgur.com/tqJ7vQt.png",
         "8":"https://i.imgur.com/KzL4ujD.png",
         "9":"https://i.imgur.com/VnYzO6n.png",
         "10":"https://i.imgur.com/NFcTIZI.png",
         "Jack":"https://i.imgur.com/V2IC3ny.png",
         "Queen":"https://i.imgur.com/AXDRt1J.png",
         "King":"https://i.imgur.com/NQXCsaU.png",
         "Ace":"https://i.imgur.com/k0GFaTC.png"
           },
  clubs:{"2":"https://i.imgur.com/ysDaS9o.png",
         "3":"https://i.imgur.com/RIiyMlZ.png",
         "4":"https://i.imgur.com/MZSsjQZ.png",
         "5":"https://i.imgur.com/Tf8Wf0x.png",
         "6":"https://i.imgur.com/uuAjp8F.png",
         "7":"https://i.imgur.com/SEqZDQ9.png",
         "8":"https://i.imgur.com/BqRzbxX.png",
         "9":"https://i.imgur.com/upCMLgV.png",
         "10":"https://i.imgur.com/Goa8PLW.png",
         "Jack":"https://i.imgur.com/5IwbagM.png",
         "Queen":"https://i.imgur.com/47ngZMk.png",
         "King":"https://i.imgur.com/CzcGuI3.png",
         "Ace":"https://i.imgur.com/k0GFaTC.png"
           },


}

for(var i=0; i<suits.length;i++){ // pushes every card into the deck array
  for(var j=0;j<values.length;j++){
    deck.push(new Card(suits[i], values[j]))
  }
}

var hit = new Button({ //creates hit button 
  x: 100,
  y: 225,
  width: 50,
  label: "hit",
  visible: true,
  onClick: function () {
    if(currentScene === 2){ //pushes new card when button is clicked 
      cardsOnTable.push(randomCard());
      if (cardsOnTable.length > cardPositions.length) {//pushes as new position for the card if there are no spaces left 
        cardPositions.push({ x: 55 + 55 * (cardsOnTable.length - 1), y: -100 });
      }
      for (var i = 0; i < cardsOnTable.length; i++) { //draws new card 
        deck[cardsOnTable[i]].drawCard(cardPositions[i].x, cardPositions[i].y);
      }
   checkPlayerTotal(cardsOnTable) //calls the fucnction to check players total 
    }
  }
});



var stand = new Button({ // creates stand button 
  x: 220,
  y: 225,
  width: 70,
  label: "stand",
  visible: true,
  onClick: function () {
    if(currentScene === 2){ //disables buttons 
      showSecondCard = true; // flips dealer card 
      stand.visible = false;
      hit.visible = false;
      var playerTotal = checkPlayerTotal(cardsOnTable);//gets player total 
      var dealerTotal;// creates dealer total variable 
      do { //added do while loop so if dealer is under 17 it has to pull atleast one card
        dealerTotal = checkDealerTotal(); //gets dealer total 
        if (dealerTotal < 17) {
          dealersCards.push(randomCard()); //pushes new card if under 17 
        }
      } 
      while (dealerTotal < 17 && playerTotal <= 21);
      
      if (playerTotal === 21) { //checks player values for different win or lose
        playerWin = true
        money = money + (betAmount * 2)
      } 
      else if (dealerTotal === 21) { //dealer blackjack
       playerLoss = true      
      }
      else if (playerTotal <= 21 && (playerTotal > dealerTotal || dealerTotal > 21)) { //player win 
        playerWin = true
        money = money + (betAmount * 2) 
      } 
      else if (dealerTotal === playerTotal && playerTotal < 21) { //tie
        money = money + betAmount
        tie = true
      }
      else { //loss
        playerLoss = true
      }
      betPlaced = false //sets bet to false after finished
      if (money <= 0 && betPlaced === false) { //calls lose if no money
        currentScene = 4
      }
      else if (money >= 200 && betPlaced === false) { //calls win if player wins 
        currentScene = 3
      }
      else {drawResetButton = true;} //draws play again button if neither 
    }
  }
});


var ten = new Button({//creates bet buttons
  x: 80,
  y: 200,
  width: 70,
  label: "$10",
  onClick: function () {
    if(currentScene === 1){
      betPlaced = true
      betAmount = 10
      currentScene = 2
      money = money - betAmount 
      hit.visible = true
      stand.visible = true
    }

  },
});
var twenty = new Button({
  x: 150,
  y: 200,
  width: 70,
  label: "$20",
  onClick: function () {
    if(currentScene === 1){
      betPlaced = true
      betAmount = 20
      currentScene = 2
      money = money - betAmount
      hit.visible = true
      stand.visible = true
    }
  },
});
var fifty = new Button({
  x: 220,
  y: 200,
  width: 70,
  label: "$50",
  onClick: function () {
    if(currentScene === 1){
      betPlaced = true
      betAmount = 50
      currentScene = 2
      money = money - betAmount
      hit.visible = true
      stand.visible = true
    }
  },
});
mouseClicked = function () {
  startGame.handleMouseClick();
  hit.handleMouseClick();
  stand.handleMouseClick();
  ten.handleMouseClick();
  twenty.handleMouseClick();
  fifty.handleMouseClick();
  reset.handleMouseClick();
};

////////////////////////// Avatar Code /////////////////////////////////////////////

var drawAvatarCR = function(avatarX,avatarY,avatarHeight){
  drawHeadCR(avatarX,avatarY,avatarHeight)
  drawBodyCR(avatarX,avatarY,avatarHeight)
}
var drawHeadCR =  function(x,y,height) {
  var ratio = height/100
  noStroke();
  fill(255, 215, 174);
  ellipse(x+0*ratio, y-50*ratio, 33*ratio, 45*ratio); // head
  triangle(x - 17*ratio, y-50*ratio, x+17*ratio, y-50*ratio, x+0*ratio, y+0*ratio); // chin
  fill(255, 255, 255);
  rect(x - 25*ratio, y-25*ratio, 50*ratio, 50*ratio);
  fill(255, 215, 174);
  ellipse(x+0*ratio, y-25*ratio, 17.5*ratio, 5*ratio); // bottom of chin
  fill(90, 56, 37);
  quad(x-2*ratio, y-67*ratio, x-15*ratio, y-56*ratio, x-19*ratio, y-60*ratio, x-14*ratio, y- 78*ratio); //hair
  quad(x-16*ratio, y-64*ratio, x+4*ratio, y-66*ratio, x-1*ratio, y-82*ratio, x-9*ratio, y-73*ratio);
  quad(x+1*ratio, y-68*ratio, x+15*ratio, y-60*ratio, x+11*ratio, y-78*ratio,x-2*ratio, y-71*ratio);
  fill(255, 215, 174);
  ellipse(x+17*ratio,y-50*ratio,5*ratio,10*ratio) //ears
  ellipse(x-17*ratio,y-50*ratio,5*ratio,10*ratio) 
  fill(255,255,255);
  ellipse(x-8*ratio,y-51*ratio,5*ratio,5*ratio); //eyes
  ellipse(x+6*ratio,y-51*ratio,5*ratio,5*ratio);
  fill(0,0,0);
  ellipse(x-8*ratio,y-51*ratio,3*ratio,3*ratio); //eyes
  ellipse(x+6*ratio,y-51*ratio,3*ratio,3*ratio);
  fill(0,0,0);
  arc(x-1*ratio,y-34*ratio,10*ratio,5*ratio,0,PI); //mouth
  fill(198,134,66);
  bezier(x-2*ratio,y-38*ratio,x-9*ratio, y-54*ratio, x+15*ratio, y-44*ratio, x+0*ratio, y-35*ratio) //nose
  fill(27, 130, 208)
  arc(x-1*ratio,y-58*ratio,40*ratio,17*ratio,PI,0) //visor
}
var drawBodyCR = function(x,y,height) {
  var ratio = height/100
  fill(60, 152, 61)
  rect(x-25*ratio,y-25*ratio,50*ratio,50*ratio) //body
  fill(255, 215, 174);
  rect(x-35*ratio,y-10*ratio,10*ratio,40*ratio) //arms
  rect(x+25*ratio,y-10*ratio,10*ratio,40*ratio)
  fill(60, 152, 61)
  ellipse(x-25*ratio,y-16*ratio,25*ratio,20*ratio) //shoulders
  ellipse(x+25*ratio,y-16*ratio,25*ratio,20*ratio)
  fill(63, 234, 234)
  textSize(20*ratio)
  text("CR",x-14*ratio,y-5*ratio) //iniitals
}

var drawAvatarHeadRC = function (avatarX, avatarY, avatarH) {
    var ratio = avatarH / 150;
    // Draw head
    fill(255, 224, 189); // Skin color
    ellipse(avatarX + 200 * ratio, avatarY + 200 * ratio, 110 * ratio, 130 * ratio); // Head

    // Draw eyes
    fill(255); 
    ellipse(avatarX + 220 * ratio, avatarY + 190 * ratio, 20 * ratio, 10 * ratio); // Left eye
    ellipse(avatarX + 180 * ratio, avatarY + 190 * ratio, 20 * ratio, 10 * ratio); // Right eye

    // Draw pupils
    fill(0); 
    ellipse(avatarX + 220 * ratio, avatarY + 190 * ratio, 10 * ratio, 10 * ratio); // Left pupil
    ellipse(avatarX + 180 * ratio, avatarY + 190 * ratio, 10 * ratio, 10 * ratio); // Right pupil

    // Draw nose
    fill(0); 
    line(avatarX + 210 * ratio, avatarY + 210 * ratio, avatarX + 200 * ratio, avatarY + 200 * ratio); // Simple line for nose
    noFill();
    arc(avatarX + 207 * ratio, avatarY + 210 * ratio, 5 * ratio, 6 * ratio, 0, PI);
    arc(avatarX + 201 * ratio, avatarY + 210 * ratio, 5 * ratio, 6 * ratio, 0, PI);

    // Draw mouth
    fill(0);
    arc(avatarX + 200 * ratio, avatarY + 225 * ratio, 40 * ratio, 30 * ratio, 0, PI); // Smiling mouth

    // Draw ears
    fill(255, 224, 189); // Skin color
    ellipse(avatarX + 255 * ratio, avatarY + 200 * ratio, 10 * ratio, 25 * ratio); // Left ear
    ellipse(avatarX + 145 * ratio, avatarY + 200 * ratio, 10 * ratio, 25 * ratio); // Right ear

    // Draw hair (top)
    fill(0); // Hair color
    arc(avatarX + 200 * ratio, avatarY + 170 * ratio, 120 * ratio, 100 * ratio, PI, 0); // Top of the hair
    fill(255, 224, 189);
    arc(avatarX + 200 * ratio, avatarY + 171 * ratio, 80 * ratio, 30 * ratio, PI, 0);

    // Draw hair (strands on the side)
    fill(0);
    rect(avatarX + 140 * ratio, avatarY + 170 * ratio, 10 * ratio, 20 * ratio); // Left hair strand
    rect(avatarX + 250 * ratio, avatarY + 170 * ratio, 10 * ratio, 20 * ratio); // Right hair strand

    // Draw hat
    fill(255, 255, 255);
    triangle(avatarX + 155 * ratio, avatarY + 145 * ratio, avatarX + 200 * ratio, avatarY + 100 * ratio, avatarX + 245 * ratio, avatarY + 145 * ratio);
};
var drawAvatarBodyRC = function (avatarX, avatarY, avatarH) {
    var ratio = avatarH / 150;
    
    // Draw shirt with a pattern (stripes)
    fill(255, 0, 0); // Shirt color
    strokeWeight(2);
    rect(avatarX + 150 * ratio, avatarY + 265 * ratio, 100 * ratio, 100 * ratio); // Shirt

    fill(129, 23, 434); // Stripe color
    rect(avatarX + 150 * ratio, avatarY + 270 * ratio, 100 * ratio, 8 * ratio);
    rect(avatarX + 150 * ratio, avatarY + 290 * ratio, 100 * ratio, 8 * ratio);
    rect(avatarX + 150 * ratio, avatarY + 310 * ratio, 100 * ratio, 8 * ratio);
    rect(avatarX + 150 * ratio, avatarY + 330 * ratio, 100 * ratio, 8 * ratio);
    rect(avatarX + 150 * ratio, avatarY + 350 * ratio, 100 * ratio, 8 * ratio);

    // Add initials
    fill(255);
    textSize(25 * ratio);
    text("R C", avatarX + 180 * ratio, avatarY + 300 * ratio); // Initials on the shirt
};
var drawAvatarRC = function (avatarX, avatarY, avatarH) {
    drawAvatarHeadRC(avatarX, avatarY, avatarH);
    drawAvatarBodyRC(avatarX, avatarY, avatarH);
};
