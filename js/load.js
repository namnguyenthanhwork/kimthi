function hasClassName(inElement, inClassName) {
    var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)');
    return regExp.test(inElement.className);
}

function addClassName(inElement, inClassName) {
    if (!hasClassName(inElement, inClassName))
        inElement.className = [inElement.className, inClassName].join(' ');
}

function removeClassName(inElement, inClassName) {
    if (hasClassName(inElement, inClassName)) {
        var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)', 'g');
        var curClasses = inElement.className;
        inElement.className = curClasses.replace(regExp, ' ');
    }
}

function toggleClassName(inElement, inClassName) {
    if (hasClassName(inElement, inClassName))
        removeClassName(inElement, inClassName);
    else
        addClassName(inElement, inClassName);
}

function toggleShape() {
    var shape = document.getElementById('shape');
    if (hasClassName(shape, 'cube') || hasClassName(shape, 'autoLoad')) {
        if (hasClassName(shape, 'cube')) {
            removeClassName(shape, 'cube');
        }
        if (hasClassName(shape, 'autoLoad')) {
            removeClassName(shape, 'autoLoad');
        }
        addClassName(shape, 'ring');
    } else {
        removeClassName(shape, 'ring');
        addClassName(shape, 'cube');
    }

    var stage = document.getElementById('stage');
    if (hasClassName(shape, 'ring'))
        stage.style.webkitTransform = 'translateZ(-200px)';
    else
        stage.style.webkitTransform = '';
}

var count = 0;
var num_bg = 1;
var next_bg = 0;
var preLoadbg;

function timedCount() {
    if (count >= 8) {
        count = 0;
        autoLoad();
    } else {
        count = count + 1;
    }
    if (next_bg >= 15) {
        num_bg = num_bg + 1;
        if (num_bg > 10) {
            num_bg = 1;
        }
        document.body.style.backgroundImage = "url(img/bg-web/" + num_bg + ".jpg)";
        preLoadbg = new Image();
        if (num_bg == 10) {
            preLoadbg.src = "img/bg-web/1.jpg";
        } else {
            preLoadbg.src = "img/bg-web/" + (num_bg + 1) + ".jpg";
        }
        next_bg = 0;
    } else {
        next_bg = next_bg + 1;
    }
    setTimeout(timedCount, 1000);
}

function autoLoad() {
    var shapeTest = document.getElementById('shape');
    if (hasClassName(shapeTest, 'cube')) {
        removeClassName(shapeTest, 'cube');
        addClassName(shapeTest, 'autoLoad');
    } else {
        toggleShape();
    }
}