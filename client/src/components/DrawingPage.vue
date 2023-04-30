<template>
  <div class="header">
    <div class="float-left">
      <div class="float-left" id="logo">
        <img :src="require('../../assets/logo.svg')" width="125" height="61">
      </div>
      <div class="float-right border-left" style="height: 61px;">
        <h1 id="header-text"></h1>
      </div>
    </div>
    <div class="float-right">
      <button id="homeBtn" @click="homeClick()">Home</button>
      <button id="finalizeBtn" @click="finalize()">Export</button>
    </div>
  </div>
  <!-- <div class="hystmodal" id="myModal" aria-hidden="true">
        <div class="hystmodal__wrap">
          <div class="loading__window modal_window" role="dialog" aria-modal="true">
            <div class="loading-text">
              Loading, please wait.
            </div>
            <div>
              <img :src="require('../../assets/spinner.svg')" height="100px" width="100px">
            </div>
          </div>
        </div>
      </div>
  
      <div class="hystmodal" id="finalizeModal" aria-hidden="true">
        <div class="hystmodal__wrap">
          <div class="finalizeModal__window modal_window" role="dialog" aria-modal="true">
            <div class="finalize-modal-text">
              <form>
                <label>
                  Name
                </label>
                <br>
                <input type="text" id="name" />
                <br>
                <label>
                  Description
                </label>
                <br>
                <input type="text" id="description">
              </form>
              <button id="saveBtn">Save</button>
              <button id="cancelBtn">Cancel</button>
            </div>
          </div>
        </div>
      </div> -->
  <div v-show="showDrawing == false"
    style="border: solid 1px #ccc; height: 360px; margin: 1em 0; text-align: center; border-radius: 4px;" id="map"
    class="map"></div>

  <div id="container" v-show="showDrawing">
    <div class="drawing">
      <canvas id="c"></canvas>
    </div>
    <div id="toolbar-container">
      <div id="toolbar">
        <div class="tool" data-tg-tour='The final step<br> <img src="b6e5ff47724ef4eb6a69.svg" height="500" width="500">'
          data-tg-order="99">
          <div class="tool-item" id="pan" @click="panMode($event)">
            <img :src="require('../../assets/pan.svg')" width="24" height="24">
            <div>Pan</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" :class="{ 'selected-tool': inDrawingMode === 'none' }" id="select" @click="selectMode()">
            <img :src="require('../../assets/select.svg')" width="24" height="24">
            <div>Select</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" :class="{ 'selected-tool': inDrawingMode === 'connect' }" id="connect"
            @click="changeDrawingMode('CONNECT')">
            <img :src="require('../../assets/diagonal-line.svg')" width="24" height="24">
            <div>Line</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" :class="{ 'selected-tool': inDrawingMode === 'circle' }" id="drawcircle"
            @click="changeDrawingMode('CIRCLE')">
            <img :src="require('../../assets/circle.svg')" width="24" height="24">
            <div>Circle</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" :class="{ 'selected-tool': inDrawingMode === 'rectangle' }" id="drawrectangle"
            @click="changeDrawingMode('RECTANGLE')">
            <img :src="require('../../assets/rectangle.svg')" width="24" height="24">
            <div>Square</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="delete" @click="deleteItem()">
            <img :src="require('../../assets/trash.svg')" width="24" height="24">
            <div>Delete</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="notes" @click="addNote()">
            <img :src="require('../../assets/note.svg')" width="24" height="24">
            <div>Note</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="compass" @click="addCompass()">
            <img :src="require('../../assets/compass.svg')" width="24" height="24">
            <div>Compass</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="callout">
            <img :src="require('../../assets/callout.svg')" width="24" height="24">
            <div>Callout</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="undo">
            <img :src="require('../../assets/undo.svg')" width="24" height="24">
            <div>Undo</div>
          </div>
        </div>
        <div class="tool">
          <div class="tool-item" id="redo">
            <img :src="require('../../assets/redo.svg')" width="24" height="24" @click="freeDraw()">
            <div>Redo</div>
          </div>
        </div>
      </div>
    </div>

    <div id="right-sidebar">
      <!-- <div class="library">
          <div id="right-sidebar-header">PLAYGROUND LIBRARIES</div>
        </div> -->

      <div class="library" data-dropdown="landscape">
        <div id="right-sidebar-header">Add To Drawing</div>
        <img :src="require('../../assets/arrow_drop_down.svg')" width="24" height="24">
      </div>
      <div class="library-items-container" id="landscape-items">
        <div class="library-item" v-for="item in imageList" @click="addImage(item.name)">
          <img class="float-left" :src="item.src" width="45" height="45" @dragstart="dragStartImage()">
          <div class="float-right library-item-text">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <!-- <div data-tg-tour="<span>My first tour</span>"> ... </div> -->

  </div>
</template>
  
<script>
//import HelloWorld from './components/HelloWorld.vue'
import drawingFunctions from '.././js/drawingfunctions.js';
import type from '.././js/types.js';
//import grid from './js/grid.js';
import { fabric } from "fabric";
import imageList from '.././js/images.js';
import axios from "axios";

export default {
  name: 'DrawingPage',
  data() {
    return {
      // base tool
      canvas: null,
      showDrawing: true,

      imageList: [],

      drawingMode: '',
      lineOrientation: '',

      calloutNumber: 1,

      // temp variable for objects being drawn
      line: new fabric.Line(),
      rectangle: new fabric.Rect(),
      circle: new fabric.Circle(),

      inDrawingMode: '',
      isDrawing: false,

      connectCircles: [],
      connectLines: [],

      lineCircle: {
        x: 0,
        y: 0,
        isInCircle: false
      },

      // constants
      lineCircleSize: 16,
      canvasWidth: 5000,
      canvasHeight: 5000,

      dontDrawStartCircle: false,
      dontDrawEndCircle: false,

      currentLineTextbox: null,

      currentImageDrag: require('../../assets/TreeThumbnail.png')
    }
  },

  async mounted() {
    const res = await axios.get(`http://localhost:9000/api`);
    console.log('api get', res);

    this.canvas = new fabric.Canvas('c', {
      selection: true,
      preserveObjectStacking: true
    });

    // this.drawingMode = drawingMode;
    // this.lineOrientations = lineOrientations;

    fabric.Object.prototype.transparentCorners = false;


    // this.canvas.isDrawingMode = true;
    // this.canvas.freeDrawingBrush.width = 5;

    this.resizeCanvas();
    //window.addEventListener('resize', this.resizeCanvas());

    this.lineOrientation = type.lineOrientations.NONE;

    this.imageList = imageList;
    console.log('image list', imageList)

    const that = this;

    fabric.Image.fromURL(require('../../assets/grid.png'), function (Image) {
        that.canvas.setBackgroundImage(Image);
        that.canvas.renderAll();
      })

    // fetch("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png")
    //   .then(result => result.blob())
    //   .then(blob => {
    //     const url = URL.createObjectURL(blob);
    //     console.log(url);
    //     fabric.Image.fromURL(url, function (Image) {
    //       that.canvas.setBackgroundImage(Image);
    //       that.canvas.renderAll();
    //     })
    //   });

    this.canvas.on('mouse:move', function (e) {
      that.mouseMove(e, this);
    });

    this.canvas.on('mouse:down', function (e) {
      that.mouseDown(e, this);
    });

    this.canvas.on('mouse:up', function () {
      that.mouseUp(this);
    });

    // drag and drop http://jsfiddle.net/Ahammadalipk/w8kkc/185/
    this.canvas.on('dragenter', function () {
      console.log('dragenter');
    });

    this.canvas.on('dragover', function (e) {
      that.dragover(e);
    });

    this.canvas.on('dragleave', function () {
      console.log('dragleave');
    });

    this.canvas.on('drop', function (e) {
      that.drop(e);
    });
  },

  created() {
    // selection should allow a user to drag over objects to select them

    //this.canvas.initState();
    //window.addEventListener("resize", this.resizeCanvas());

  },

  methods: {
    addCanvasResize() {
      // try this? or kms
      //https://www.nightprogrammer.com/vue-js/how-to-detect-screen-width-and-update-it-on-resize-in-vue-js-example/
    },

    resizeCanvas() {
      console.log('resize', document.getElementsByClassName('drawing'));

      if (document.getElementsByClassName('drawing').length > 0) {
        const container = document.getElementsByClassName('drawing')[0];
        const canvasContainer = container.getElementsByClassName('canvas-container')[0];
        canvasContainer.style.width = 'unset';
        canvasContainer.style.height = 'unset';
        this.canvas.setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
      }
    },

    mouseMove(e, that) {
      if (that.isDragging) {
        var event = e.e;
        var vpt = that.viewportTransform;
        vpt[4] += event.clientX - that.lastPosX;
        vpt[5] += event.clientY - that.lastPosY;
        this.enforceBounds();
        that.requestRenderAll();
        that.lastPosX = event.clientX;
        that.lastPosY = event.clientY;
      }

      if (this.isDrawing) {

        if (this.inDrawingMode == type.drawingMode.LINE || this.inDrawingMode == type.drawingMode.DASH || this.inDrawingMode == type.drawingMode.CONNECT) {
          var pointer = this.canvas.getPointer(e.e);
          var x;
          var y;

          switch (this.lineOrientation) {
            case type.lineOrientations.NONE:
              x = pointer.x;
              y = pointer.y;
              break;
            case type.lineOrientations.HORIZONTAL:
              x = pointer.x;
              y = window._line.y1;
              break;
            case type.lineOrientations.VERTICAL:
              x = window._line.x1;
              y = pointer.y;
              break;
          }

          let autoLock = false;
          let autoLockX = 0;
          let autoLockY = 0;

          if (this.inDrawingMode == type.drawingMode.CONNECT) {
            for (let circle of this.connectCircles) {
              const cords = circle._getLeftTopCoords();

              var isCenter = pointer.x == cords.x + this.lineCircleSize && pointer.y == cords.y + this.lineCircleSize;

              if (isCenter) {
                circle.set('opacity', 1.0);
                circle.set('selectable', false);
                this.canvas.renderAll();
              } else {

                if (circle.containsPoint(pointer)) {
                  autoLock = true;
                  autoLockX = cords.x + this.lineCircleSize;
                  autoLockY = cords.y + this.lineCircleSize;
                }

                circle.set('opacity', 0.5);
                circle.set('selectable', false);
                this.canvas.renderAll();
              }
            }
          }

          this.dontDrawEndCircle = false;
          if (autoLock == true) {
            this.dontDrawEndCircle = true;
            // auto lock to center of circle
            this.line.set({
              x2: autoLockX,
              y2: autoLockY
            });
          } else {
            //move the end of the fence line                                                                 
            this.line.set({
              x2: x,
              y2: y
            });
          }
        }

        if (this.inDrawingMode == type.drawingMode.RECTANGLE) {
          // TODO delete pointer?
          pointer = this.canvas.getPointer(e.e);
          var origX = this.rectangle.left;
          var origY = this.rectangle.top;

          if (origX > pointer.x) {
            this.rectangle.set({
              left: Math.abs(pointer.x)
            });
          }
          if (origY > pointer.y) {
            this.rectangle.set({
              top: Math.abs(pointer.y)
            });
          }

          this.rectangle.set({
            width: Math.abs(origX - pointer.x)
          });

          this.rectangle.set({
            height: Math.abs(origY - pointer.y)
          });
        }


        if (this.inDrawingMode == type.drawingMode.CIRCLE) {
          // TODO delete pointer?
          pointer = this.canvas.getPointer(e.e);

          // TODO delete origX?
          origX = this.circle.left;

          this.circle.set({
            radius: Math.abs(origX - pointer.x)
          })
        }

        drawingFunctions.recalculate(this.canvas, this.line);
      } else {
        if (this.inDrawingMode == type.drawingMode.CONNECT) {
          // loop over cirlces to see if cursor is over it
          // TODO delete pointer?
          pointer = this.canvas.getPointer(e.e);

          let isInCircle = false;
          let inCircleX = 0;
          let inCircleY = 0;

          for (let circle of this.connectCircles) {
            var cords = circle._getLeftTopCoords();
            const isCenter = pointer.x == cords.x + this.lineCircleSize && pointer.y == cords.y + this.lineCircleSize;

            if (isCenter) {
              circle.set('opacity', 1.0);
              circle.set('selectable', false);
              this.canvas.renderAll();
            } else {

              if (circle.containsPoint(pointer)) {
                isInCircle = true;
                inCircleX = cords.x;
                inCircleY = cords.y;
              }

              circle.set('opacity', 0.5);
              circle.set('selectable', false);
              this.canvas.renderAll();
            }

            // if hovering circle then auto connect line to circle
            if (isInCircle == true) {
              this.lineCircle.isInCircle = true;
              this.lineCircle.x = inCircleX + this.lineCircleSize;
              this.lineCircle.y = inCircleY + this.lineCircleSize;
            } else {
              this.lineCircle.isInCircle = false;
              this.lineCircle.x = 0;
              this.lineCircle.y = 0;
            }
          }
        }
      }

      this.canvas.renderAll();
    },

    mouseUp(that) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      that.setViewportTransform(that.viewportTransform);
      that.isDragging = false;
      that.selection = true;

      if (this.inDrawingMode == type.drawingMode.LINE || this.inDrawingMode == type.drawingMode.DASH) {
        this.line.setCoords();
        this.isDrawing = false;
        this.makeObjectsNotSelectable(this.canvas);
        //this.canvas.saveState();
      }

      if (this.inDrawingMode == type.drawingMode.CONNECT) {

        const line = this.line;
        if (line.x1 !== line.x3 && line.y1 !== line.y2) {
          if (this.dontDrawEndCircle === false) {
            var lineEndCircle = new fabric.Circle({
              left: this.line.x2 - this.lineCircleSize,
              top: this.line.y2 - this.lineCircleSize,
              strokeWidth: 5,
              opacity: 0.5,
              radius: this.lineCircleSize,
              fill: 'transparent',
              // stroke: '#666',
              perPixelTargetFind: true,
              selectable: false
            });

            lineEndCircle.position = "left";
            lineEndCircle.hasControls = false;

            this.canvas.add(lineEndCircle);
            this.connectCircles.push(lineEndCircle);
          }

          if (this.dontDrawStartCircle === false) {
            var lineStartCircle = new fabric.Circle({
              left: this.line.x1 - this.lineCircleSize,
              top: this.line.y1 - this.lineCircleSize,
              strokeWidth: 5,
              opacity: 0.5,
              radius: this.lineCircleSize,
              fill: 'transparent',
              //stroke: '#666',
              perPixelTargetFind: true,
              selectable: false
            });


            lineStartCircle.position = "left";
            lineStartCircle.hasControls = false;

            this.canvas.add(lineStartCircle);
            this.connectCircles.push(lineStartCircle);
          }
        }

        this.line.setCoords();
        this.isDrawing = false;
        this.makeObjectsNotSelectable(this.canvas);

        if (this.currentLineTextbox) {
          this.canvas.remove(this.currentLineTextbox);
        }

        //this.canvas.saveState();
      }

      if (this.inDrawingMode == type.drawingMode.RECTANGLE) {
        this.rectangle.setCoords();
        this.isDrawing = false;
        this.makeObjectsNotSelectable(this.canvas);
        //this.canvas.saveState();
      } else if (this.inDrawingMode == type.drawingMode.CIRCLE) {
        this.circle.setCoords();
        this.isDrawing = false;
        this.makeObjectsNotSelectable(this.canvas);
        //this.canvas.saveState();
      }
    },

    mouseDown(e, that) {
      var evt = e.e;

      if (this.inDrawingMode === type.drawingMode.PAN) {
        that.isDragging = true;
        that.selection = false;
        that.lastPosX = evt.clientX;
        that.lastPosY = evt.clientY;
      }

      if (this.inDrawingMode == type.drawingMode.LINE || this.inDrawingMode == type.drawingMode.CONNECT) {
        this.dontDrawStartCircle = false;
        this.isDrawing = true;
        var pointer = this.canvas.getPointer(e.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        if (this.inDrawingMode == type.drawingMode.CONNECT && this.lineCircle.isInCircle == true) {
          points[0] = this.lineCircle.x;
          points[1] = this.lineCircle.y;
          this.dontDrawStartCircle = true;
        }


        if (this.inDrawingMode == type.drawingMode.CONNECT) {
          this.createConnectLine(points);
        }
      }

      if (this.inDrawingMode == type.drawingMode.DASH) {

        this.isDrawing = true;
        const pointer = this.canvas.getPointer(e.e);
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        //make the dash line
        this.line = new fabric.Line(points, {
          isDash: true,
          orientation: this.lineOrientation,
          perPixelTargetFind: true,
          stroke: 'black',
          strokeWidth: 5,
          strokeDashArray: [15, 5],
          //hasBorders: false,
          //lockScalingX: true,
          //lockScalingY: true,
          strokeUniform: true,
          lockSkewingX: true,
          lockSkewingY: true,
          hoverCursor: 'crosshair',
        });

        this.line.set('toObjectType', 'dashLine');
        this.canvas.add(this.line);
      }

      if (this.inDrawingMode == type.drawingMode.RECTANGLE) {

        this.isDrawing = true;
        const pointer = this.canvas.getPointer(e.e);
        var origX = pointer.x;
        var origY = pointer.y;

        this.rectangle = new fabric.Rect({
          isRectangle: true,
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          radius: 5,
          angle: 0,
          stroke: 'black',
          strokeWidth: 5,
          fill: '',
          transparentCorners: false,
          hoverCursor: 'crosshair',
          selectable: true
        });

        this.rectangle.set('toObjectType', 'rectangle');
        this.canvas.add(this.rectangle);
      }

      if (this.inDrawingMode == type.drawingMode.CIRCLE) {

        this.isDrawing = true;
        const pointer = this.canvas.getPointer(e.e);
        const origX = pointer.x;
        const origY = pointer.y;

        this.circle = new fabric.Circle({
          isCircle: true,
          left: origX,
          top: origY,
          originX: 'center',
          originY: 'center',
          radius: 1,
          stroke: 'black',
          strokeWidth: 5,
          fill: '',
          hoverCursor: 'crosshair',
          selectable: true
        });

        this.circle.set('toObjectType', 'circle');
        this.canvas.add(this.circle);
      }
    },

    enforceBounds() {
      var vpt = this.canvas.viewportTransform;
      const minX = this.canvas.getWidth() - (this.canvasWidth * this.canvas.getZoom());
      const minY = this.canvas.getHeight() - (this.canvasHeight * this.canvas.getZoom());
      vpt[4] = Math.min(Math.max(vpt[4], minX), 0);
      vpt[5] = Math.min(Math.max(vpt[5], minY), 0);
    },

    makeObjectsNotSelectable() {
      this.canvas.discardActiveObject();
      this.canvas.hoverCursor = 'default';
      this.canvas.selection = false;
      this.canvas.forEachObject(function (o) {
        o.selectable = false;
      });
      this.canvas.renderAll();
    },

    makeObjectsSelectable() {
      this.canvas.selection = true;
      this.canvas.forEachObject(function (o) {
        o.selectable = true;
      });
      this.canvas.renderAll();
    },

    getLineCoords(line) {
      const points = line.calcLinePoints();
      const matrix = line.calcTransformMatrix();
      const point1 = fabric.util.transformPoint({ x: points.x1, y: points.y1 }, matrix);
      const point2 = fabric.util.transformPoint({ x: points.x2, y: points.y2 }, matrix);
      return { x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y };
    },

    calcAngle(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const theta = Math.atan2(dy, dx);
      return theta * (180 / Math.PI);
    },

    createConnectLine(points) {
      var lineSize = new fabric.Textbox('', {
        name: 'test',
        fontSize: 26,
        fontFamily: 'sans-serif',
        lineHeight: 1,
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        borderColor: '#999999',
        padding: 0,
        textBackgroundColor: 'transparent',
        hoverCursor: 'default',
        width: 100,
        height: 20,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true
      });

      lineSize.set('toObjectType', 'fenceSizeBox');

      this.line = new fabric.Line(points, {
        isFence: true,
        stroke: 'black',
        //name: 'fenceSegment' + segmentId,
        // orientation: orientation,
        drawnDirection: 'none',
        //fenceType: fType,
        perPixelTargetFind: true,
        strokeWidth: 5,
        //hasBorders: false,
        //lockScalingX: true,
        //lockScalingY: true,
        strokeUniform: true,
        lockSkewingX: true,
        lockSkewingY: true,
        hoverCursor: 'crosshair',
        lineLength: lineSize.name
      });

      //this.line.set('toObjectType', 'fence');

      lineSize.set({
        left: this.line.left - 5,
        top: this.line.top - 5,
      });

      lineSize.setCoords();

      this.line.set('toObjectType', 'line');

      this.canvas.add(this.line);
      this.canvas.add(lineSize);

      this.connectLines.push(this.line);

      this.currentLineTextbox = lineSize;
    },

    changeDrawingMode(drawingMode) {
      this.inDrawingMode = type.drawingMode[drawingMode];
      this.makeObjectsNotSelectable();
    },

    deleteItem() {
      this.inDrawingMode = type.drawingMode.NONE;
      drawingFunctions.deleteSelected(this.canvas);
    },

    addNote() {
      this.inDrawingMode = type.drawingMode.NONE;

      var note = new fabric.Textbox('', {
        fill: 'black',
        fontSize: 16,
        fontFamily: 'Arial',
        lineHeight: 1,
        borderColor: 'black',
        padding: 1,
        textBackgroundColor: 'white',
        hoverCursor: 'default',
        width: 200,
        height: 100,
        lockScalingX: false,
        lockScalingY: false,
        lockUniScaling: false,
        lockSkewingX: true,
        lockSkewingY: true,
        top: 30,
        left: 30,
        backgroundColor: 'white',
        text: 'Note:'
      });

      this.canvas.add(note);
      //this.canvas.saveState();
    },

    selectMode() {
      this.inDrawingMode = type.drawingMode.NONE;
      this.makeObjectsSelectable();
    },

    panMode(e) {
      e.preventDefault();
      this.inDrawingMode = type.drawingMode.PAN;
      this.canvas.discardActiveObject();
      this.makeObjectsNotSelectable(this.canvas);
    },

    addCompass() {

    },

    dragenter() {

    },

    dragover(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      //e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
      // NOTE: comment above refers to the article (see top) -natchiketa

      return false;
    },

    dragleave() {

    },

    drop(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }

      var img = document.querySelector('#treepng');

      console.log('event: ', e);

      var newImage = new fabric.Image(img, {
        width: img.width,
        height: img.height,
        // Set the center of the new object based on the event coordinates relative
        // to the canvas container.
        left: 0,
        top: 0
      });

      this.canvas.add(newImage);

      return false;
    },

    dragStartImage() {
      //this.currentImageDrag
    },

    homeClick() {
      this.showDrawing = !this.showDrawing;
      const latlong = new google.maps.LatLng(41.2645421, -95.9716378);
      const map = new google.maps.Map(document.getElementById('map'), {
        center: latlong,
        zoom: 20,
        tilt: 0,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        mapTypeId: "satellite"
      });
    },

    addImage(name) {
      const image = imageList.find(x => x.name === name);

      this.inDrawingMode = type.drawingMode.NONE;

      const that = this;

      fabric.Image.fromURL(image.src, function (oImg) {
          oImg.set({
            left: (200),
            top: (100),
            readOut: {
              imagetype: image.name
            }
          });

        that.canvas.add(oImg);
        //that.canvas.saveState();
      });
    },
    freeDraw() {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.width = 5;
    },
    async finalize() {
      // const response = await axios.post(`http://localhost:9000/api`, {
      //   name: 'test',
      //   password: 'dispass'
      // });

      // console.log(response);

      this.inDrawingMode = type.NONE;
      //const rawData = _canvas.toDatalessJSON();

      const bounds = drawingFunctions.getDrawingBounds(this.canvas);
      drawingFunctions.finalize(this.canvas);
      const blob = drawingFunctions.exportBlob(this.canvas, bounds);
      const aTag = document.createElement('a');
      aTag.href = URL.createObjectURL(blob);
      aTag.download = 'drawing.png';
      aTag.click();
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../app.scss";
</style>