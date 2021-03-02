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

    }, []);

    const Sketch = (p) => {
        let grid, rows, cols, cellSize, maxWidth, maxHeight, rowIdx, colIdx, start, end, mouseInCanvas, aboveStart, aboveEnd, lockedStart, lockedEnd, aboveNode, currentNode;
        cellSize = 20;
        grid = [];
        maxWidth = window.innerWidth-50;
        maxHeight = window.innerHeight;

        //start of setup function
        p.setup = () => {
            //p.createCanvas(maxWidth,maxHeight); // width, height.
            p.createCanvas(1000,600);
            p.background(0);
            rows = p.height/cellSize;
            cols = p.width/cellSize;
            //create grid
            for (let i=0; i<rows; i++){
                grid.push([]);
                for (let j=0; j<cols; j++){
                    grid[i][j] = new Node(i,j);
                    if (p.random() < 0.4 && i>1 && cols >1){
                        grid[i][j]['obstacle'] = true;
                    }
                }
            }
            //initialise the starting cell and ending cell.
            start = [0,0];
            end = [Math.floor(rows/2), Math.floor(cols/2)]
            grid[0][0]['start'] = true;
            grid[0][0]['current'] = true;
            grid[0][0]['distance'] = 0;
            grid[Math.floor(rows/2)][Math.floor(cols/2)]['end'] = true;

            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    let currentNode = grid[i][j];
                    if (currentNode.start===true){
                        p.push()
                        p.fill('purple');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else if (currentNode.end===true){
                        p.push()
                        p.fill('blue');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else {
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5);
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
                this.rowIdx = i;
                this.colIdx = j;
            }
        }

        //start of draw loop
        p.draw = () => {
            console.log('pathfinder is looping');
            // redraw the grid on each iteration to match the current state..(should try implementing only drawing cells that change)
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    let currentNode = grid[i][j]; 
                    if (currentNode.start===true){
                        p.push()
                        p.fill('purple');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else if (currentNode.end===true){
                        p.push()
                        p.fill('blue');
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else if (currentNode.obstacle===true){
                        p.push()
                        let c = p.color(245, 167, 66);
                        p.fill(c);
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else if (currentNode.checked===true){
                        p.push()
                        let c = p.color(50, 55, 100);
                        p.fill(c);
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5)
                        p.pop()
                    }
                    else {
                        p.rect(j*cellSize, i*cellSize, cellSize, cellSize, 5);
                    }
                }
            }

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

                    if (newRowIdx >=0 && newRowIdx < rows && newColIdx >=0 && newColIdx <cols){
                        var allowed = true;
                    } else {var allowed = false};

                    if (allowed && (newRowIdx != start[0] || newColIdx!= start[1])){
                        grid[start[0]][start[1]]['start'] = false; //remove color from previous start
                        grid[start[0]][start[1]]['current'] = false; 
                        grid[start[0]][start[1]]['distance'] = Infinity; 

                        start[0] = newRowIdx;
                        start[1] = newColIdx;

                        grid[newRowIdx][newColIdx]['start'] = true;
                        grid[newRowIdx][newColIdx]['current'] = true;
                        grid[newRowIdx][newColIdx]['distance'] = 0;
                    }
                }
                if (lockedEnd && mouseInCanvas){
                    let newRowIdx = Math.floor(p.mouseY/cellSize);
                    let newColIdx = Math.floor(p.mouseX/cellSize);

                    if (newRowIdx >=0 && newRowIdx < rows && newColIdx >=0 && newColIdx <cols){
                        var allowed = true;
                    } else {var allowed = false}

                    if (allowed && (newRowIdx != end[0] || newColIdx!= end[1])){
                        grid[end[0]][end[1]]['end'] = false; //remove color from previous end
                        end[0] = newRowIdx;
                        end[1] = newColIdx;
                        grid[newRowIdx][newColIdx]['end'] = true;
                    }
                }
            }
            p.mouseReleased = () => {
                lockedStart = false;
                lockedEnd = false;
            }

            //Dijkstras Algorithm 
            // find the current node we're looking at
            for (let i=0; i<rows; i++){
                let searchRow = grid[i];
                let test = searchRow.find(element => element.current == true)
                if (test){
                    currentNode = test;
                }
            }
            // check the neighbouring nodes
            let idx1 = currentNode.rowIdx;
            let idx2 = currentNode.colIdx

            p.push();
            p.fill('pink');
            p.rect(idx2*cellSize, idx1*cellSize, cellSize, cellSize, 5)
            p.pop();

            let idxToCheck = [[idx1+1, idx2], [idx1-1, idx2], [idx1, idx2 +1], [idx1, idx2-1]];
            for (let entry in idxToCheck){
                let currRowIdx = idxToCheck[entry][0];
                let currColIdx = idxToCheck[entry][1];
                if (currRowIdx>=0 && currRowIdx<rows && currColIdx >=0 && currColIdx<cols){
                    let checkNode = grid[currRowIdx][currColIdx];
                    if (checkNode.visited == true || checkNode.obstacle == true){continue}; //no need to revisit nodes
                    checkNode.checked = true;
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
    //end of draw loop

    return (
        <div>
            <div ref={myRef} className='my-canvas'></div>
        </div>
    )

};
export default PathFinder;