var grid = {
    setGrid(_canvas, imageUrl) {
        _canvas.setBackgroundImage(imageUrl, () => {}, { objectCaching: false });
    },    
    
    ///////////////make the grid on the canvas///////////////////////////
    // no longer used since grid is too big. now it is just a static image
    // makeGridOld(_canvas){
    //     // fabric.perfLimitSizeTotal = 225000000;
    //     // fabric.maxCacheSideLimit = 11000;
    //     //draw grid lines on the canvas    
    //     var gridWidth = 10000;//_canvas.width;
    //     var gridHeight = 10000;//_canvas.height;
    
    //     // to manipulate grid after creation
    //     var gridGroup = new fabric.Group([], {left: 0, top: 0, objectCaching: false});
    
    //     var gridSize = 10; // define grid size
    
    //     // define presentation option of grid
    //     var lineOption = {stroke: 'rgba(0,0,0,.1)', strokeWidth: 1, selectable:false, objectCaching: false};
    //     var lineOption10 = {stroke: 'rgba(0,0,0,.1)', strokeWidth: 2, selectable:false, objectCaching: false};
    
    //     // do in two steps to limit the calculations
    //     // first loop for vertical line
    //     for(var i = Math.ceil(gridWidth/gridSize); i--;){
    //         if((i % 10) == 0){
    //             gridGroup.addWithUpdate( new fabric.Line([gridSize*i, 0, gridSize*i, gridHeight], lineOption10) );
    
    //             if(i>0){
    //                 gridGroup.addWithUpdate( 
    //                     new fabric.Text(i.toString(), 
    //                         { 
    //                             left: (gridSize*i) - 6, 
    //                             top: 0,
    //                             stroke: 'rgba(0,0,0,.2)',
    //                             fontSize: 11,                        
    //                             fontFamily: 'sans-serif'
    //                         }
    //                     )
    //                 );
    //             }
    //         } else {
    //             gridGroup.addWithUpdate( new fabric.Line([gridSize*i, 0, gridSize*i, gridHeight], lineOption) );
    //         };
    //     }
    //     // second loop for horizontal line
    //     for(var i = Math.ceil(gridHeight/gridSize); i--;){
    //         if((i % 10) == 0){
    //             gridGroup.addWithUpdate( new fabric.Line([0, gridSize*i, gridWidth, gridSize*i], lineOption10) );
    
    //             if(i>0){
    //                 gridGroup.addWithUpdate( 
    //                     new fabric.Text(i.toString(), 
    //                         { 
    //                             left: 0, 
    //                             top: (gridSize*i) - 6,
    //                             stroke: 'rgba(0,0,0,.2)',
    //                             fontSize: 11,                        
    //                             fontFamily: 'sans-serif'
    //                         }
    //                     )
    //                 );
    //             }
    //         } else {
    //             gridGroup.addWithUpdate( new fabric.Line([0, gridSize*i, gridWidth, gridSize*i], lineOption) );
    //         };
    //     }
    //     // put it on the canvas as an image instead of objects    
    //     gridGroup.setCoords();
    //     _canvas.add(gridGroup);
    
    //     // const aTag = document.createElement('a');
    //     // aTag.href = _canvas.toDataURL({
    //     //     format: 'png',
    //     //     quality: 1,
    //     //     width: 10000,
    //     //     height: 10000
    //     // });
    //     // aTag.download = 'test.png';
    //     // aTag.click();
    //     // gridGroup.cloneAsImage(function(clone) {
    //     //         clone.set({
    //     //             name:'gridImage',
    //     //             originX: 'left',
    //     //             originY: 'top',
    //     //             left: 0,
    //     //             top: 0,
    //     //             width: gridWidth,
    //     //             height: gridHeight
    //     //         });            
    //     //         _canvas.setBackgroundImage(clone, _canvas.renderAll.bind(_canvas));                    
    //     //     }
    //     // ); 
    // }
}

export default grid;
