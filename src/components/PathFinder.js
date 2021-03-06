import React, {useState, useEffect} from 'react';
import p5 from 'p5';


const PathFinder = (props) => {

    const myRef = React.createRef();
    let p5Object;

    useEffect(() => {
        if (p5Object){
            p5Object.remove();
            console.log('Removed P5 drawing');
        }
        p5Object = new p5(Sketch, myRef.current);
        console.log('initalised an instance of a p5 object...');
        
        return () =>{
            console.log('unmounted pathfinder component')
            p5Object.noLoop();
            p5Object.remove();
        }
    }, []); //dependancies set as an empty array meaning this is only executed once on the first render. 

    const Sketch = (p) => {
        let grid, rows, cols, cellSize, rowIdx, colIdx, start, end, mouseInCanvas, aboveStart, aboveEnd, aboveEmpty, lockedStart, lockedEnd, aboveNode, currentNode;
        let searching = false;
        cellSize = 20;

        const toggleSearch = () => {
            searching = !searching;
            console.log(searching);
        }

        const createStartGrid = () => {
            grid = [];
            for (let i=0; i<rows; i++){
                grid.push([]);
                for (let j=0; j<cols; j++){
                    grid[i][j] = new Node(i,j);
                    p.fill('white');
                    p.rect(j*cellSize, i*cellSize, cellSize, cellSize);
                }
            }
            p.push();
            start = [0,0];
            p.fill('purple');
            p.rect(start[1]*cellSize, start[0]*cellSize, cellSize, cellSize);

            end = [Math.floor(rows/2), Math.floor(cols/2)];
            p.fill('blue');
            p.rect(end[1]*cellSize, end[0]*cellSize, cellSize, cellSize);
            p.pop();
            grid[0][0]['start'] = true;
            grid[0][0]['current'] = true;
            grid[0][0]['distance'] = 0;
            grid[Math.floor(rows/2)][Math.floor(cols/2)]['end'] = true;
            p.loop();
            searching = false;
        }

        const generateMaze = () => {
            createStartGrid();
            let available = [];
            let stack = [], current;
            console.log('maze generated');
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    if (j%2 == 0 || i%2 == 0){
                        grid[i][j]['obstacle'] = true;
                        //p.fill(p.color(245, 167, 66));
                        p.fill('black');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize);
                    } else {
                        available.push(grid[i][j]);
                    }
                }
            }
            // choose initial cell randomly, mark it visited and push to stack. 
            let initialCell = p.random(available);
            initialCell.mazeVisited = true;
            stack.push(initialCell);
            console.log(isInGrid(31,1));
            // while the stack is not empty
            while (stack.length > 0){
            
                //pop a cell from the stack and make it current cell
                current = stack.pop();
                let adjacent = current.getMazeNeighbours();
                
                // if the current cell has any unvisited neighbours
                
                let unvisited = adjacent.filter(entry => {
                    return grid[entry[0]][entry[1]]['mazeVisited'] == false
                });
                
                if (unvisited.length >0){ // if the current cell has any neighbours which have not been visited
                    //push the current cell to the stack
                    stack.push(current);

                    // choose one of the unvisited neighbours
                    unvisited = p.random(unvisited);

                    //remove the wall between current cell and chosen cell
                    let posX = unvisited[1];
                    let posY = unvisited[0];
                    let unvisitedCell = grid[posY][posX];
                    let wallX = unvisited[3];
                    let wallY = unvisited[2];
                    p.fill('white');
                    p.rect(wallX*cellSize, wallY*cellSize, cellSize, cellSize);
                    grid[wallY][wallX]['obstacle'] = false;

                    // mark the chosen cell as visited
                    unvisitedCell.mazeVisited = true;

                    //push chosen cell to stack
                    stack.push(unvisitedCell);
                }
            }
            console.log(grid);
            // find start and end position set by user;
            
        }




        //start of setup function
        p.setup = () => {
            let canvas = p.createCanvas(1000,620);
            p.background(0);
            rows = p.height/cellSize;
            cols = 820/cellSize;

            //create key;
            p.push()
            p.fill('purple');
            p.rect(825, 100, cellSize, cellSize)
            p.fill('blue')
            p.rect(825, 150, cellSize, cellSize)
            p.fill(p.color(245, 167, 66));
            p.rect(825, 200, cellSize, cellSize)

            //text for key
            p.fill('white');
            p.text('Start cell, drag to move', 850, 100, 100, 50);
            p.text('End cell, drag to move', 850, 150, 100, 50);
            p.text('Obstacle, click and drag to add', 850, 205, 130, 50);
            p.pop()

            //create start stop button
            let startButton = p.createButton('Start/Stop');
            startButton.position(canvas.position().x + 860, canvas.position().y + 250);
            startButton.mousePressed(toggleSearch);
            startButton.addClass('button1');

            //create reset button
            let resetButton = p.createButton('Reset');
            resetButton.position(canvas.position().x + 930, canvas.position().y + 250);
            resetButton.mousePressed(createStartGrid);
            resetButton.addClass('button1');
            
            let mazeButton = p.createButton('Generate Maze');
            mazeButton.position(canvas.position().x + 915, canvas.position().y + 300);
            mazeButton.mousePressed(generateMaze);
            mazeButton.addClass('button1');
           
            createStartGrid();
            console.log(grid);
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    let currentNode = grid[i][j];
                    if (currentNode.start===true){
                        p.push()
                        p.fill('purple');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize)
                        p.pop()
                    }
                    else if (currentNode.end===true){
                        p.push()
                        p.fill('blue');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize)
                        p.pop()
                    }
                    else {
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize);
                    }
                }
            }
        }
        //end of setup function


        const isInGrid = (rowIdx, colIdx) => {
            if (rowIdx>=0 && rowIdx<rows && colIdx>=0 && colIdx<cols){return true}
            else {return false}  
        }

        class Node {
            constructor(i, j){
                this.start = false; //will set to true if node is the starting point;
                this.end = false;  //will set to true if node is the end point;
                this.visited = false;
                this.distance = Infinity; //need to change to zero if start node
                this.current = false;
                this.checked = false;
                this.obstacle = false;
                this.mazeVisited = false;
                this.rowIdx = i;
                this.colIdx = j;
            }

            getMazeNeighbours = () => {
                let x = this.colIdx;
                let y = this.rowIdx;
                // neighbour position, wall position
                let neighbours = [[y, x+2, y, x+1], [y, x-2, y, x-1], [y+2, x, y+1, x], [y-2, x, y-1,x]];
                let myRet = [];
                for (let index in neighbours){
                    let entry = neighbours[index];
                    if (isInGrid(entry[0],entry[1])){
                        myRet.push(entry);
                    }
                }
                return myRet;
            }
        }

        //start of draw loop
        p.draw = () => {

            rowIdx = Math.floor(p.mouseY/cellSize);
            colIdx = Math.floor(p.mouseX/cellSize);
            if (rowIdx >= 0 && rowIdx <rows && colIdx >= 0 && colIdx < cols){
                mouseInCanvas = true;
            } else {mouseInCanvas = false}

            if (mouseInCanvas){
                aboveNode = grid[rowIdx][colIdx];
            }

            if (mouseInCanvas && aboveNode.start == true){
                aboveStart = true
            } else { aboveStart = false};

            if (mouseInCanvas && aboveNode.end == true){
                aboveEnd = true;
            } else {aboveEnd = false}
            
            if (mouseInCanvas && aboveNode.obstacle == false && aboveNode.start == false && aboveNode.end == false){
                aboveEmpty = true;
            } else {aboveEmpty = false};

            p.mousePressed = () => { 
                if (aboveStart){ //check if the mouse is pressed on the start cell
                    lockedStart = true;
                } else {lockedStart = false}
                if (aboveEnd){ //check if the mouse is pressed on the start cell
                    lockedEnd = true;
                } else {lockedEnd=false}
            }

            p.mouseDragged = () => {
                if (lockedStart && mouseInCanvas){
                    let newRowIdx = Math.floor(p.mouseY/cellSize);
                    let newColIdx = Math.floor(p.mouseX/cellSize);

                    if (isInGrid(newRowIdx,newColIdx)){
                        var allowed = true;
                    } else {var allowed = false};

                    if (allowed && (newRowIdx != start[0] || newColIdx!= start[1])){
                        grid[start[0]][start[1]]['start'] = false; //remove color from previous start
                        grid[start[0]][start[1]]['current'] = false; 
                        grid[start[0]][start[1]]['distance'] = Infinity;
                        p.fill('white');
                        p.rect(start[1]*cellSize, start[0]*cellSize, cellSize, cellSize); //draw white cell

                        start[0] = newRowIdx;
                        start[1] = newColIdx;

                        grid[newRowIdx][newColIdx]['start'] = true;
                        grid[newRowIdx][newColIdx]['current'] = true;
                        grid[newRowIdx][newColIdx]['distance'] = 0;
                        p.fill('purple');
                        p.rect(newColIdx*cellSize, newRowIdx*cellSize, cellSize, cellSize);
                    }
                }
                if (lockedEnd && mouseInCanvas){
                    let newRowIdx = Math.floor(p.mouseY/cellSize);
                    let newColIdx = Math.floor(p.mouseX/cellSize);

                    if (isInGrid(newRowIdx,newColIdx)){
                        var allowed = true;
                    } else {var allowed = false}

                    if (allowed && (newRowIdx != end[0] || newColIdx!= end[1])){
                        grid[end[0]][end[1]]['end'] = false; //remove color from previous end
                        p.fill('white');
                        p.rect(end[1]*cellSize, end[0]*cellSize, cellSize, cellSize); //draw white cell

                        end[0] = newRowIdx;
                        end[1] = newColIdx;
                        grid[newRowIdx][newColIdx]['end'] = true;
                        p.fill('blue');
                        p.rect(newColIdx*cellSize, newRowIdx*cellSize, cellSize, cellSize);
                    }
                }

                if (aboveEmpty && mouseInCanvas){
                    let newRowIdx = Math.floor(p.mouseY/cellSize);
                    let newColIdx = Math.floor(p.mouseX/cellSize);
                    if (isInGrid(newRowIdx, newColIdx)){
                        grid[newRowIdx][newColIdx]['obstacle'] = true;
                        let c = p.color(245, 167, 66);
                        p.fill(c);
                        p.rect(newColIdx*cellSize, newRowIdx*cellSize, cellSize, cellSize);
                    }
                }
            }
            p.mouseReleased = () => {
                lockedStart = false;
                lockedEnd = false;
            }

            //Dijkstras Algorithm 
            // find the current node we're looking at
            if (searching){
                for (let i=0; i<rows; i++){
                let searchRow = grid[i];
                let test = searchRow.find(element => element.current == true)
                if (test){
                    currentNode = test;
                }
            }
            // check the neighbouring nodes
            let idx1 = currentNode.rowIdx;
            let idx2 = currentNode.colIdx;
            let idxToCheck = [[idx1+1, idx2], [idx1-1, idx2], [idx1, idx2 +1], [idx1, idx2-1]];
            for (let entry in idxToCheck){
                let currRowIdx = idxToCheck[entry][0];
                let currColIdx = idxToCheck[entry][1];
                if (currRowIdx>=0 && currRowIdx<rows && currColIdx >=0 && currColIdx<cols){
                    let checkNode = grid[currRowIdx][currColIdx];
                    if (checkNode.visited == true || checkNode.obstacle == true){continue}; //no need to revisit nodes
                    checkNode.checked = true;

                    if (checkNode.end != true){
                        let c = p.color(50, 55, 100);
                        p.fill(c);
                        p.rect(currColIdx*cellSize, currRowIdx*cellSize, cellSize, cellSize);
                    }
                    
                    let testDistance = currentNode.distance + 1;
                    if (testDistance < checkNode.distance){
                        checkNode.distance = testDistance;
                    } 
                }
            }
            // mark the current node as visited and no longer the current node.
            currentNode.visited = true;
            currentNode.current = false;
            // check if current node is the end node and hence search is complete
            if (currentNode.end == true){
                console.log('complete');
                console.log('total distance was: ', currentNode.distance);
                let shortestPath = [];
                let pathNode = currentNode;
                shortestPath.push(currentNode);
                let counter = 0;
                while (pathNode.distance){
                    counter ++;
                    let currentDistance = pathNode.distance;
                    let x = pathNode.colIdx;
                    let y = pathNode.rowIdx;
                    let potentialParents = [[y,x-1], [y, x+1], [y-1,x], [y+1,x]];
                    for (let entry in potentialParents){
                        let a = potentialParents[entry][0];
                        let b = potentialParents[entry][1];
                        if (isInGrid(a,b) && grid[a][b]['distance'] == currentDistance - 1){
                            pathNode = grid[a][b];
                            shortestPath.push(pathNode);
                            break;
                        }
                    }
                }
                for (let i=0; i<shortestPath.length; i++){
                    let myNode = shortestPath[i];
                    p.push();
                    p.fill(p.color(66,245,239));
                    p.rect(myNode.colIdx*cellSize, myNode.rowIdx*cellSize, cellSize, cellSize, 5)
                    p.pop();
                }
                p.noLoop();
            }

            // select the next node to be the current node
            let shortestDist = Infinity;
            let nextNode = currentNode;
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    let testingNode = grid[i][j];
                    if (i == currentNode.rowIdx && j == currentNode.colIdx){continue}
                    if (testingNode.visited == true){continue}
                    if (grid[i][j]['distance']<shortestDist){
                        shortestDist = grid[i][j]['distance'];
                        nextNode = grid[i][j]
                    }
                }
            }
            nextNode.current = true;
            }
            }
            
    }
    //end of draw loop

    return (
        <div>
            <div ref={myRef} className='my-canvas'></div>
        </div>
    )

};
export default PathFinder;