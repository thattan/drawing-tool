import { fabric } from "../../node_modules/fabric";

fabric.Canvas.prototype.getItemByName = function (name) {
  var object = null,
      objects = this.getObjects();

  for (var i = 0, len = this.size(); i < len; i++) {
      if (objects[i].name && objects[i].name === name) {
          object = objects[i];
          break;
      }
  }

  return object;
};

function getLineCoords(line) {
  const points = line.calcLinePoints();
  const matrix = line.calcTransformMatrix();
  const point1 = fabric.util.transformPoint({ x: points.x1, y: points.y1 }, matrix);
  const point2 = fabric.util.transformPoint({ x: points.x2, y: points.y2 }, matrix);
  return { x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y };
}

function calcAngle(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const theta = Math.atan2(dy, dx);
  return theta * (180 / Math.PI);
}

function deleteCallout(groupName, _canvas) {
  _canvas.forEachObject(function (o) {
    if (typeof o !== 'undefined') {
      if (Object.prototype.hasOwnProperty.call(o, 'groupName') && o.groupName == groupName) {
        _canvas.remove(o);
      }
    }
  });
}

var drawingFunctions = {
  // Gets the size of the drawing to make the image the right size
  getDrawingBounds(_canvas, legendPadding) {
    let left = null;
    let top = null;
    let bottom = null;
    let right = null;
    const objects = _canvas.getObjects();
    console.log(objects);
    if (objects.length > 0) {
      // get bounds of fence
      objects.forEach(o => {
        const coords = o.aCoords;
        left = left ? Math.min(coords.tl.x, left) : coords.tl.x;
        top = top ? Math.min(coords.tl.y, top) : coords.tl.y;
        const boxRight = coords.br.x;
        const boxBottom = coords.br.y;
        bottom = bottom ? Math.max(boxBottom, bottom) : boxBottom;
        right = right ? Math.max(boxRight, right) : boxRight;
      });
    }
    else {
      left = 0;
      top = 0;
      bottom = _canvas.getHeight();
      right = _canvas.getWidth();
    }

    // legend padding is how much space we need at the bottom so that the legend does not override the fence
    legendPadding = legendPadding || 100;
    // guesstimate for legend
    left -= 35;
    top -= 35;
    bottom += legendPadding;
    right += 35;

    // make square
    const width = right - left;
    const height = bottom - top;
    if (width > height) {
      const adjustment = (width - height) / 2;
      top -= adjustment;
      bottom += adjustment;
    }
    else if (height > width) {
      const adjustment = (height - width) / 2;
      left -= adjustment;
      right += adjustment;
    }

    return {
      left,
      top,
      bottom,
      right
    }
  },

  exportBlob(_canvas, bounds) {
    bounds = bounds || this.getDrawingBounds(_canvas);
    // need to reset the viewport transform otherwise the zoom and pan messes with the export
    _canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    _canvas.renderAll();
    var dataURL = _canvas.toDataURL({
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      left: bounds.left,
      top: bounds.top,
      format: 'png',
    });

    // convert the dataurl to a blob (to send back to the server)
    var bytestring = atob(dataURL.split(',')[1]);
    var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(bytestring.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytestring.length; i++) {
      ia[i] = bytestring.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  },

  //delete the selected objects
  deleteSelected(_canvas) {
    _canvas.getActiveObjects().forEach((obj) => {

      //there are lots of objects in a callout so remove them all
      if (Object.prototype.hasOwnProperty.call(obj, 'name') && obj.name.substring(0, 7) == 'callout') {
        deleteCallout(obj.groupName, _canvas);
      }

      //dont let user remove textbox that shows measurements for lines and gates
      if (obj.type === 'textbox' && Object.prototype.hasOwnProperty.call(obj, 'name')) {
        return;
      }

      _canvas.remove(obj);
    });

    //recalculate(_canvas);
    _canvas.discardActiveObject().renderAll();
  },

  //do this so you don't move objects while drawing
  makeObjectsNotSelectable(_canvas) {
    console.log('no select')
    _canvas.discardActiveObject(); //deselect any thing selected
    _canvas.hoverCursor = 'default'; //show the user they are ready to draw
    _canvas.selection = false;
    _canvas.forEachObject(function (o) {

      o.selectable = false;

    });
    _canvas.renderAll();
  },

  makeObjectsSelectable(_canvas) {
    _canvas.selection = true;
    _canvas.forEachObject(function (o) {
      o.selectable = true;
    });
    _canvas.renderAll();
  },

  //move fence label with the line and calculate while line moves
  recalculate(_canvas, line) {

    // var lines = _canvas.getObjects('line');

    // lines.forEach(function (line) {

      //line.hasOwnProperty('lineLength')
      if (Object.prototype.hasOwnProperty.call(line, 'lineLength')) {
        var length = Math.round(Math.sqrt((line.width * line.width) + (line.height * line.height)) / 10);

        //move the measure boxes in the middle of the line and show the line length in feet on the cooresponding fence lines
        var lineSize = _canvas.getItemByName(line.lineLength);
        if (lineSize) {
          const lineCoords = getLineCoords(line);
          const perpAngle = (calcAngle({ x: lineCoords.x1, y: lineCoords.y1 }, { x: lineCoords.x2, y: lineCoords.y2 }) + 90) * Math.PI / 180;
          const startPoint = {
            x: lineCoords.x1 + ((lineCoords.x2 - lineCoords.x1) / 2),
            y: lineCoords.y1 + ((lineCoords.y2 - lineCoords.y1) / 2)
          };

          const newPoint = {
            x: startPoint.x + 25 * Math.cos(perpAngle),
            y: startPoint.y + 25 * Math.sin(perpAngle),
          }

          lineSize.set({
            left: newPoint.x,
            top: newPoint.y,
            originX: 'center',
            originY: 'center'
          });

          //the user edited the length so use their number
          if (lineSize.get('state') == 'edited') {
            length = parseInt(lineSize.get('text'));
          }
          lineSize.set('text', length.toString());
          lineSize.setCoords();
        }
      }
    //   }
    // });
  },

  //makes it easier to edit textboxes for lines and gates
  startOneClickEdit(target) {
    if (target.get('name')) {
      var name = target.get('name')
      if (name.substring(0, 8) == 'lineSize' || name.substring(0, 11) == 'gateSizefor') {

        target.set({
          text: '',
          backgroundColor: '#dbdbdb',
          textBackgroundColor: '#dbdbdb'
        });

        target.enterEditing();
      }
    }
  },

  //one click editing makes the textboxes look funny so clean them up
  // cleanupTexboxes() {
  //   var lines = _canvas.getObjects('line');

  //   lines.forEach(function (line) {

  //     if (line.hasOwnProperty('fenceLengthName')) {
  //       var lineSize = _canvas.getItemByName(line.fenceLengthName);
  //       if (lineSize.get('text') == '') {
  //         lineSize.set('text', '0');
  //       }

  //       if (lineSize) {
  //         lineSize.set({
  //           backgroundColor: 'transparent',
  //           textBackgroundColor: 'transparent'
  //         });
  //       };
  //     };
  //   });


  //   var images = _canvas.getObjects('image');

  //   images.forEach(function (image) {

  //     if (image.hasOwnProperty('isGate')) {
  //       var gateSize = _canvas.getItemByName('gateSizefor' + image.gateNumber);
  //       if (gateSize.get('text') == '') {
  //         gateSize.set('text', '0');
  //       }

  //       if (gateSize) {
  //         gateSize.set({
  //           backgroundColor: 'transparent',
  //           textBackgroundColor: 'transparent'
  //         });
  //       };
  //     };
  //   });

  //   recalculate(_canvas);
  // },

  // getLineCoords(line) {
  //   const points = line.calcLinePoints();
  //   const matrix = line.calcTransformMatrix();
  //   const point1 = fabric.util.transformPoint({ x: points.x1, y: points.y1 }, matrix);
  //   const point2 = fabric.util.transformPoint({ x: points.x2, y: points.y2 }, matrix);
  //   return { x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y };
  // },

  // project function pulled from https://jsfiddle.net/soulwire/UA6H5/
  project(p, a, b) {
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: p.x - a.x, y: p.y - a.y };
    const len = atob.x * atob.x + atob.y * atob.y;
    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / len));
    dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    const point = {
      x: a.x + atob.x * t,
      y: a.y + atob.y * t
    };

    const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
    const left = dot < 1;
    let angle = calcAngle(a, b);
    if (left) {
      angle -= 180;
    }
    return {
      point: {
        x: a.x + atob.x * t,
        y: a.y + atob.y * t
      },
      distance,
      angle,
      left
    };
  },

  finalize(_canvas) {
    //remove background grid image
    // _canvas.backgroundImage = 0;
    // _canvas.backgroundColor = '#FFFFFF';

    // var previousLegend = _canvas.getItemByName('legend');
    // if (previousLegend != undefined) {
    //     _canvas.remove(previousLegend);
    // }

    //add a legend for each fence type used
    // var group = new fabric.Group([], { name: 'legend' });
    // var top = 0;
    // var width = 200;
    // var padding = 4;

    // var legendHeader = new fabric.Textbox('', {
    //     fill: 'black',
    //     fontSize: 16,
    //     fontFamily: 'Arial',
    //     lineHeight: 1,
    //     borderColor: 'black',
    //     padding: 1,
    //     textBackgroundColor: 'white',
    //     hoverCursor: 'default',
    //     lockScalingX: false,
    //     lockScalingY: false,
    //     lockUniScaling: false,
    //     lockSkewingX: true,
    //     lockSkewingY: true,
    //     top: top,
    //     left: 0,
    //     width,
    //     backgroundColor: 'white',
    //     text: 'Fence style legend:'
    // });
    // group.addWithUpdate(legendHeader);
    // console.log(legendHeader.height);
    // top += Math.round(legendHeader.height + padding);

    // var note = new fabric.Textbox('', {
    //     fill: 'black',
    //     fontSize: 16,
    //     fontFamily: 'Arial',
    //     lineHeight: 1,
    //     borderColor: 'black',
    //     padding: 1,
    //     textBackgroundColor: 'white',
    //     hoverCursor: 'default',
    //     lockScalingX: false,
    //     lockScalingY: false,
    //     lockUniScaling: false,
    //     lockSkewingX: true,
    //     lockSkewingY: true,
    //     top: top,
    //     left: 0,
    //     width,
    //     backgroundColor: 'white',
    //     text: 'This drawing is not to scale.'
    // });
    // group.addWithUpdate(note);
    // top += Math.round(note.height + padding);

    // for (let i of inventory) {
    //     let legendColor = new fabric.Rect({
    //         left: 0,
    //         top: top,
    //         originX: 'left',
    //         originY: 'top',
    //         width: 10,
    //         height: 10,
    //         angle: 0,
    //         stroke: getFenceType(i.DrawingToolFenceType).color,
    //         strokeWidth: 5,
    //         fill: getFenceType(i.DrawingToolFenceType).color,
    //         transparentCorners: false,
    //         selectable: false
    //     });

    //     let legendDescription = new fabric.Textbox('', {
    //         fill: 'black',
    //         fontSize: 16,
    //         fontFamily: 'Arial',
    //         lineHeight: 1,
    //         borderColor: 'black',
    //         padding: 1,
    //         textBackgroundColor: 'white',
    //         hoverCursor: 'default',
    //         width: 200,
    //         height: 100,
    //         lockScalingX: false,
    //         lockScalingY: false,
    //         lockUniScaling: false,
    //         lockSkewingX: true,
    //         lockSkewingY: true,
    //         top: top,
    //         left: 20,
    //         backgroundColor: 'white',
    //         text: getFenceType(i.DrawingToolFenceType).fType
    //     });

    //     top += Math.round(Math.max(legendColor.height, legendDescription.height) + padding);

    //     group.addWithUpdate(legendColor);
    //     group.addWithUpdate(legendDescription);
    // };

    // _canvas.add(group);
    // group.setPositionByOrigin(
    //     new fabric.Point(bounds.left + 10, bounds.bottom - group.height - 10),
    //     'left',
    //     'top'
    // );
    // group.setCoords();

    _canvas.renderAll();
  },

  // given x and y cords get the area of the polygon
  calcPolygonArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.ceil((Math.abs(total) / 100) / 5) * 5;
  },

  // stackoverflow: https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript
  sortPointsClockwise(points) {
    // Find min max to get center
    // Sort from top to bottom
    points.sort((a, b) => a.y - b.y);

    // Get center y
    const cy = (points[0].y + points[points.length - 1].y) / 2;

    // Sort from right to left
    points.sort((a, b) => b.x - a.x);

    // Get center x
    const cx = (points[0].x + points[points.length - 1].x) / 2;

    // Center point
    const center = { x: cx, y: cy };

    // Pre calculate the angles as it will be slow in the sort
    // As the points are sorted from right to left the first point
    // is the rightmost

    // Starting angle used to reference other angles
    var startAng;
    points.forEach(point => {
      var ang = Math.atan2(point.y - center.y, point.x - center.x);
      if (!startAng) { startAng = ang }
      else {
        if (ang < startAng) {  // ensure that all points are clockwise of the start point
          ang += Math.PI * 2;
        }
      }
      point.angle = ang; // add the angle to the point
    });

    // Sort clockwise;
    points.sort((a, b) => a.angle - b.angle);

    return points;
  },

  calculateTotalPolygonArea(canvas) {

    // TODO: filter by polygons to start and then remove if statements
    const objects = canvas.getObjects();
    let totalArea = 0;

    for (let i = 0; i < objects.length; i++) {
      if (objects[i].get('type') === 'polygon') {

        let contained = false;
        for (let y = 0; y < objects.length; y++) {

          if (i === y)
            continue;

          if (contained === true)
            break;

          if (objects[y].get('type') === 'polygon') {
            contained = objects[i].isContainedWithinObject(objects[y]);
          }
        }

        if (contained === false) {
          console.log('outside polygon', objects[i], objects[i].get('points'));
          totalArea += this.calcPolygonArea(objects[i].get('points'));
        }
      }
    }

    console.log('total area', totalArea);
    return totalArea;
  }
}

export default drawingFunctions;