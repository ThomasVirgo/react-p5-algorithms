import React, { useState, useEffect } from 'react';
import p5 from 'p5';



const Sort = (props) => {

    const myRef = React.createRef();
    let p5Object;

    useEffect(() => {
        if (p5Object) {
            p5Object.remove();
            console.log('Removed P5 drawing');
        }
        p5Object = new p5(Sketch, myRef.current);
        console.log('initalised an instance of a p5 object...');

        return () => { // clean up function is called upon unmounting the component
            p5Object.noLoop();
            p5Object.remove();
        }

    }, []);

    const Sketch = (p) => {
        let list = [];
        let canvasHeight = 600;
        let canvasWidth = 1200;
        let barWidth = 5;
        let numBars = canvasWidth / barWidth;

        p.setup = () => {
            p.createCanvas(canvasWidth, canvasHeight);
            p.background(0);
            //p.frameRate(30); // executes the draw loop once per second
            for (let i = 0; i < numBars; i++) {
                let barHeight = Math.floor(p.random() * canvasHeight)
                list.push(barHeight);
                p.fill('white');
                p.rect(i * barWidth, 0, barWidth, barHeight);
            };
            console.log('ran setup', list);
            console.log('the framerate is:', p.frameRate());
        }

        p.draw = () => { // drawing loop executed FPS times per second
            let changesMade = 0;
            for (let i = 0; i < numBars; i++) {//looping through each bar
                let current = list[i];
                let next = list[i + 1];
                if (i == numBars - 1) {
                    next = Infinity;
                }
                if (current > next) { //then swap the entries...
                    changesMade++
                    list[i] = next;
                    list[i + 1] = current;
                }
                
            }
            drawBars(list);
            if (changesMade == 0) {
                p.noLoop();
                console.log('completed list is', list);
            }
        }

        const drawBars = (list) =>{
            p.fill('black');
            p.rect(0, 0, canvasWidth, canvasHeight)
            for (let i=0; i<list.length; i++){
                p.fill('white');
                p.rect(i * barWidth, 0, barWidth, list[i]);
            }
        } 
    }


    return (
        <div>
            <div className='my-canvas' ref={myRef}></div>
        </div>
    )
}

export default Sort;