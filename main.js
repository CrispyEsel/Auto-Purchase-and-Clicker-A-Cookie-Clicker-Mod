/* Auto-Purchase and Clicker Mod for Cookie Clicker
    Hello! This mod adds an auto-purchase feature for buildings, aswell as an auto-clicker for cookies, 
    golden cookies, and fortune cookies. 

    For those unaware, Cookie Clicker is an incremental game where the player clicks on a cookie to generate cookies, 
    which can then be used to purchase buildings and upgrades that automatically generate more cookies over time.

    As the nature of an incremental game, the player will eventually reach a point where they can no longer 
    actively progress through the game without a large amount of time wasted as they must wait for their cookies to 
    accumulate over time.

    Therefore, this mod is a solution to that problem, as it allows the player to automate the process of 
    purchasing buildings and clicking on cookies.

    The Auto-Purchaser has a customizable menu where you can select the number of buildings (1, 5, 10, 100, 1000) 
    and the type of building to target.From there, you can toggle the auto-purchaser, this mod will calculate how 
    long it will take to purchase the selected number of buildings based on your current cookies, cookies per second, 
    and dropdown selections. 
    
    In addition, there is an auto-clicker menu where you can toggle the auto-clicker for cookies, 
    golden cookies, and fortune cookies.

    To design this mod, I have had to dig through the game of Cookie Clicker as well as Steam's save and load feature.
    This mod sticks to the game's languages of Javascript, HTML, and CSS.

    Overall, the purpose of this mod is to automate the player's actions so you have the ability to do other things
    with your time!

    Thank you for using this mod, and I hope it helps you progress through Cookie Clicker more efficiently!
    - Emanuel
*/

Game.registerMod('auto purchase and clicker', {
    init: function() {
        console.log('Auto-Purchase and Clicker loaded!');

        // Executes after Steam loads a save file so the mod can work properly.
        // Without this line, this mod does not work due to the default values of the buildings (0).
        var originalJustLoadedSave = Steam.justLoadedSave;

        Steam.justLoadedSave = function() {
            var result = originalJustLoadedSave.apply(this, arguments);
            buildAutoBuy(); // Calls the function to build the auto-buy panel
            buildAutoClicker(); // Calls the function to build the auto-clicker panel
            
            // Sends a game notifcation to the player that the mod has been successfully loaded.
            Game.Notify(`Auto-Purchase and Clicker!`,'',[11,34]);

            return result;
        };
    },
    save: function() {}, // This mod does not require any saving functionality
    load: function(str) {} // This mod does not require any loading functionality
});

/* draggablePanel function
    This function makes a fixed panel draggable by the user. It listens for mouse events to track 
    the dragging state and updates the panel's position accordingly. The panel's position is 
    constrained within the left side of the Cookie Clicker window to prevent it from being 
    dragged off-screen or over other game elements.
*/
function draggablePanel(panel) {
    var isDragging = false;
    var eventClientX; // Last recorded X position of the mouse when dragging.
    var eventClientY; // Last recorded Y position of the mouse when dragging.

    // Used to stop dragging when the mouse button is released anywhere on the panel.
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // Used to start dragging when the mouse button is pressed down on the panel.
    panel.addEventListener('mousedown', function(e) {
        isDragging = true;
        eventClientX = e.clientX;
        eventClientY = e.clientY;
    });

    // Used to detect the position of the panel as it is being moved by the player
    document.addEventListener('mousemove', function(event) {
        if (!isDragging) return;

        panel.style.top = ((event.clientY - eventClientY) + panel.offsetTop) + 'px';
        panel.style.left = ((event.clientX - eventClientX) + panel.offsetLeft) + 'px';
        eventClientX = event.clientX;
        eventClientY = event.clientY;

        // Restricts the panel from being moved off the screen's left side
        if (panel.offsetLeft < 0) {
            panel.style.left = '0px';
        }
        
        // Restricts the panel from being moved off the screen's top side
        if (panel.offsetTop < 0) {
            panel.style.top = '0px';
        }

        // Restricts the panel from being moved past 30% of the screen's width to the right
        var offsetRight = window.innerWidth * 0.30;
        if (panel.offsetLeft + panel.offsetWidth > offsetRight) {
            panel.style.left = (offsetRight - panel.offsetWidth) + 'px';
        }

        // Restricts the panel from being moved past the screen's bottom side
        var offsetBottom = panel.offsetTop + panel.offsetHeight;
        if (offsetBottom > window.innerHeight) {
            panel.style.top = (window.innerHeight - panel.offsetHeight) + 'px';
        }
    });
}

/* buildAutoBuy function
    This function creates the auto-buy panel (1 of 2 panels), which allows the player to 
    select a building type and quantity to automatically purchase. 
    
    This function also calculates the time required to accumulate enough cookies for the 
    purchase based on the player's current cookies and cookies per second. 
    
    Lastly, this function includes a toggle button to enable or disable the auto-buy functionality.

    NOTE: This game's buildings are stored in an array called ObjectsById, this is referenced multiple times
    in the function. In addition, we use the following variables created by the game: Game.cookies which is
    the total number of cookies the player has, and Game.cookiesPs which is the rate that the player is
    acculumating cookies per second.
*/
function buildAutoBuy() {

    // Creates the panel and its style including dimensions, fonts, and colors.
    var panel = document.createElement('div');
    panel.id = 'BuyPanel';
    panel.style.position = 'fixed';
    panel.style.top = '60%';
    panel.style.left = '2.5%';
    panel.style.background = 'linear-gradient(#3a2a1a, #1a1008)'; // Brown, Chosen to match the game's color.
    panel.style.color = '#fff';
    panel.style.padding = '.5rem';
    panel.style.border = '1px solid #fda';                        // Gold, Chosen to match the game's color.
    panel.style.zIndex = 9999;
    panel.style.fontFamily = 'Tahoma, Arial, sans-serif';
    panel.style.fontSize = 'clamp(1.2vw, 2vh, 1.3rem)';
    panel.style.width = 'clamp(23%, 10%, 30%)';

    // Creates a dropdown of quantity options to buy.
    var numberSelect = document.createElement('select');
    numberSelect.id = 'numSelect';
    [1, 5, 10, 100, 1000].forEach(function(n) {
        var opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        numberSelect.appendChild(opt);
    });
    numberSelect.style.width = 'clamp(35px, 4vw, 60px)';

    // Creates a dropdown of building types.
    var typeSelect = document.createElement('select');
    typeSelect.id = 'typeSelect';
    for (var i in Game.ObjectsById) {
        var me = Game.ObjectsById[i];
        var opt = document.createElement('option');
        opt.value = me.id;
        opt.textContent = me.name;
        typeSelect.appendChild(opt);
    }
    typeSelect.style.width = 'clamp(120px, 2vw, 300px)';
    typeSelect.style.height = 'clamp(20px, 2vh, 30px)';


    // Creates a button for the Auto-Purchase.
    var toggleButton = document.createElement('button');
    var toggleAutoBuy = false; // Tracks whether Auto-Purchase is enable.
    toggleButton.id = 'AutoBuyToggle';
    toggleButton.textContent = 'Off';
    toggleButton.style.backgroundColor = '#b52f18';
    toggleButton.style.marginTop = '8px';
    toggleButton.style.fontFamily = 'Tahoma, Arial, sans-serif';
    toggleButton.style.border = '1px solid #fda';

    // This event listener allows for the player to interact with the button.
    toggleButton.addEventListener('click', function() {
        toggleAutoBuy = !toggleAutoBuy;                       // Flips the Auto-Buy Boolean.
        if (toggleAutoBuy) {
            toggleButton.style.backgroundColor = '#6ea644'; // #6ea644 is Green.
            toggleButton.textContent = 'On';
        } else {
            toggleButton.style.backgroundColor = '#b52f18'; // #b52f18 is Red.
            toggleButton.textContent = 'Off';
        }
    });

    /* The autoBuy function grabs the numerical value that the player selected in typeSelect and numberSelect 
    and uses the game's buy() function to automatically buy the object requested.
    */
    function autoBuy() {
        if (!toggleAutoBuy) return;

        Game.ObjectsById[typeSelect.value].buy(parseInt(numberSelect.value));
    }

    /* The updateCalculation function calculates and displays the amount of time that it will take for the
    player to acculumate the required number of cookies to purchase the building that the player set in
    the dropdown menu (parameters).
    */
    function updateCalculation() {
        var building = Game.ObjectsById[typeSelect.value];
        var amount = parseInt(numberSelect.value);
        var totalCost = 0;

        // Runs until it reaches the requested number of buildings that the player wishes to buy.
        for (var i = 0; i < amount; i++) {
            totalCost += building.getPrice();
            building.amount++;
        }

        building.amount -= amount;

        // Subtracts the totalCost by number of cookies the player has at the current moment.
        var cookiesNeeded = Math.max(0, totalCost - Game.cookies);

        var timeDuration = cookiesNeeded / Game.cookiesPs;
        if (timeDuration < 0) timeDuration = 0;

        if (timeDuration > 0) {
            var timeDurationMins = timeDuration / 60;
            var timeDurationHours = timeDurationMins / 60;
            var timeDurationDays = timeDurationHours / 24;
            var timeDurationWeeks = timeDurationDays / 7;
        }

        // Nested-if statements in order to minimize code logic.
        // NOTE: toFixed(n) fixes the result to n decimal places.
        if (timeDurationHours > 24) {
            if (timeDurationDays > 7) {
                resultDiv.textContent = 'This will take about ' + timeDurationWeeks.toFixed(2) + ' weeks.';
            } else {
                resultDiv.textContent = 'This will take about ' + timeDurationDays.toFixed(2) + ' days.';
            }
        } else if (timeDuration > 60) {
            if (timeDurationMins > 60) {
                resultDiv.textContent = 'This will take about ' + timeDurationHours.toFixed(2) + ' hours.';
            } else {
                resultDiv.textContent = 'This will take about ' + timeDurationMins.toFixed(2) + ' minutes.';
            }
        } else {
            resultDiv.textContent = 'This will take about ' + timeDuration.toFixed(2) + ' seconds.';
        }
    }

    // Displays the amount of time needed to reach the inputed parameters.
    var resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    resultDiv.style.marginTop = '8px';
    resultDiv.style.fontFamily = 'Tahoma, Arial, sans-serif';
    updateCalculation();

    // Assembles the complete panel.
    var multiplierLabel = document.createElement('span');
    multiplierLabel.textContent = 'Multiplier: ';
    multiplierLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    var typeLabel = document.createElement('span');
    typeLabel.textContent = 'Upgrade Type: ';
    typeLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    var autoBuyLabel = document.createElement('span');
    autoBuyLabel.textContent = 'Auto-buy: ';
    autoBuyLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    panel.appendChild(multiplierLabel);
    panel.appendChild(numberSelect);
    panel.appendChild(document.createElement('br'));
    panel.appendChild(typeLabel);
    panel.appendChild(typeSelect);
    panel.appendChild(document.createElement('br'));
    panel.appendChild(autoBuyLabel);
    panel.appendChild(toggleButton);
    panel.appendChild(document.createElement('br'));
    panel.appendChild(resultDiv);

    draggablePanel(panel);
    document.body.appendChild(panel);

    // Calls the listed function every 750ms so as the player gains more cookies, numbers change accordingly.
    setInterval(updateCalculation, 750);
    setInterval(autoBuy, 750);
}


/* The buildAutoClicker function creates another panel with the option for three different
    type of autoclickers:

    Regular: Auto-clicks the regular cookie that is used for purchases involving 
    buildings, upgrades, prestiges, etc.

    Golden Cookie: Auto-clicks the Golden Cookie, a rare cookie that has a small chance to appear at a random
    spot in the game window after a certain amount of time and will disappear quickly. Clicking this cookie 
    gives the player a boost for a random amount of time.

    Fortune Cookie: Auto-clicks the Fortune Cookie, an unlockable type of cookie from prestiging where
    similar to the Golden Cookie, appears after a certian amount of time and gifts a random amount of
    cookies to the player.

    All three are initialized as false but when toggled in the panel, create an event where after a
    select amount of time in setInterval, it auto-clicks the screen wherever the selected cookie
    would appear
*/
function buildAutoClicker() {
    var autoClickRegular = false;
    var autoClickGolden = false;
    var autoClickFortune = false;

    function clickCookie() {
        if (!autoClickRegular) return;
        var cookie = document.getElementById('bigCookie');
        autoClick(cookie, 'click');
    }

    function clickGolden() {
        if (!autoClickGolden) return;

        // In the game's code, Golden Cookies appear first in the 'shimmers' container.
        // Therefore, when grabbing the element, it provides the location of the Golden Cookie
        var goldenCookie = document.getElementById('shimmers').firstChild; 
        autoClick(goldenCookie, 'click');
    }

    function clickFortune() {
        if (!autoClickFortune) return;

        // Fortune ticker events are handled differently from clickable DOM elements -
        // the game exposes a direct click handler via Game.tickerL.click()
        if (Game.TickerEffect && Game.TickerEffect.type === 'fortune') {
            Game.tickerL.click();
        }
    }

    /**
       Dispatches a synthetic click event on the given DOM element.
       Uses the legacy createEvent/initEvent API (deprecated in 2015 but still functional in Cookie Clicker)
       rather than `new MouseEvent(...)` per current implementation.
       @param {HTMLElement} target - element to click
       @param {string} type - event type, expected to be 'click'
     */
    function autoClick(target, type) {
        if (!target) return;
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, true, true);
        if (target) {
            target.dispatchEvent(e);
        }
    }

    // Creates the panel and its style including dimensions, fonts, and colors.
    var clickPanel = document.createElement('div');
    clickPanel.id = 'ClickPanel';
    clickPanel.style.position = 'fixed';
    clickPanel.style.bottom = '6%';
    clickPanel.style.left = '6%';
    clickPanel.style.background = 'linear-gradient(#3a2a1a, #1a1008)';
    clickPanel.style.color = '#fff';
    clickPanel.style.padding = '.5rem';
    clickPanel.style.border = '1px solid #fda';
    clickPanel.style.zIndex = 9999;
    clickPanel.style.fontFamily = 'Tahoma, Arial, sans-serif';
    clickPanel.style.fontSize = 'clamp(1.2vw, 2vh, 1.3rem)';
    clickPanel.style.width = 'clamp(15%, 5%, 20%)';
    clickPanel.style.height = 'clamp(75px, 10%, 100px)';
    clickPanel.style.textAlign = 'Center';
    clickPanel.style.paddingTop = '1px';
    clickPanel.style.paddingBottom = '20px';

    // Creates a button for the regular Auto-Clicker.
    var autoClickButton = document.createElement('button');
    autoClickButton.id = 'AutoClick';
    autoClickButton.textContent = 'Off';
    autoClickButton.style.backgroundColor = '#b52f18';
    autoClickButton.style.marginTop = '8px';
    autoClickButton.style.fontFamily = 'Tahoma, Arial, sans-serif';
    autoClickButton.style.border = '1px solid #fda';

    // This event listener allows for the player to interact with the Auto-Clicker button.
    autoClickButton.addEventListener('click', function() {
        autoClickRegular = !autoClickRegular;
        if (autoClickRegular) {
            autoClickButton.style.backgroundColor = '#6ea644';
            autoClickButton.textContent = 'On';
        } else {
            autoClickButton.style.backgroundColor = '#b52f18';
            autoClickButton.textContent = 'Off';
        }
    });

    // Creates a button for the Golden Cookie Auto-Clicker.
    var autoGoldenButton = document.createElement('button');
    autoGoldenButton.id = 'AutoGolden';
    autoGoldenButton.textContent = 'Off';
    autoGoldenButton.style.backgroundColor = '#b52f18';
    autoGoldenButton.style.marginTop = '8px';
    autoGoldenButton.style.fontFamily = 'Tahoma, Arial, sans-serif';
    autoGoldenButton.style.border = '1px solid #fda';

    // This event listener allows for the player to interact with the Golden Cookie Auto-Clicker button.
    autoGoldenButton.addEventListener('click', function() {
        autoClickGolden = !autoClickGolden;
        if (autoClickGolden) {
            autoGoldenButton.style.backgroundColor = '#6ea644';
            autoGoldenButton.textContent = 'On';
        } else {
            autoGoldenButton.style.backgroundColor = '#b52f18';
            autoGoldenButton.textContent = 'Off';
        }
    });

    // Creates a button for the Fortune Cookie Auto-Clicker.
    var autoFortuneButton = document.createElement('button');
    autoFortuneButton.id = 'AutoFortune';
    autoFortuneButton.textContent = 'Off';
    autoFortuneButton.style.backgroundColor = '#b52f18';
    autoFortuneButton.style.marginTop = '8px';
    autoFortuneButton.style.fontFamily = 'Tahoma, Arial, sans-serif';
    autoFortuneButton.style.border = '1px solid #fda';
    
    // This event listener allows for the player to interact with the Fortune Cookie Auto-Clicker button.
    autoFortuneButton.addEventListener('click', function() {
        autoClickFortune = !autoClickFortune;
        if (autoClickFortune) {
            autoFortuneButton.style.backgroundColor = '#6ea644';
            autoFortuneButton.textContent = 'On';
        } else {
            autoFortuneButton.style.backgroundColor = '#b52f18';
            autoFortuneButton.textContent = 'Off';
        }
    });

    // Assembles the Auto-Clicker Panel
    var clickLabel = document.createElement('span');
    clickLabel.textContent = 'Auto-Clicker: ';
    clickLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    var goldenLabel = document.createElement('span');
    goldenLabel.textContent = 'Auto-Golden: ';
    goldenLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    var fortuneLabel = document.createElement('span');
    fortuneLabel.textContent = 'Auto-Fortune: ';
    fortuneLabel.style.fontFamily = 'Tahoma, Arial, sans-serif';

    clickPanel.appendChild(clickLabel);
    clickPanel.appendChild(autoClickButton);
    clickPanel.appendChild(document.createElement('br'));
    clickPanel.appendChild(goldenLabel);
    clickPanel.appendChild(autoGoldenButton);
    clickPanel.appendChild(document.createElement('br'));
    clickPanel.appendChild(fortuneLabel);
    clickPanel.appendChild(autoFortuneButton);

    draggablePanel(clickPanel);
    document.body.appendChild(clickPanel);

    // Calls the listed function every 25ms, which is the speed of the auto-clicker!.
    setInterval(clickCookie, 25);
    setInterval(clickGolden, 25);
    setInterval(clickFortune, 25);
}