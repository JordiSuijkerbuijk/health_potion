import { useEffect, useRef } from "react";
import style from "./BackgroundDotsSection.module.scss";

export default function BackgroundDotsSection() {
  //Data we need to make the canvas look good
  const canvasEl = useRef(null);
  const context = useRef(null);
  const canvasWidth = useRef(0);
  const canvasHeight = useRef(0);
  const canvasX = useRef(0);
  const canvasY = useRef(0);

  //We use this to check which circles we want to increase in size.
  const xInCanvas = useRef(0);
  const yInCanvas = useRef(0);

  const animFrame = useRef(null);

  const circlesArray = useRef([]);
  const mouseCircle = useRef(null);
  const affectedRadius = useRef(null);

  useEffect(() => {
    if (!canvasEl?.current || !window) return;
    context.current = canvasEl.current.getContext("2d");
    setCanvasSize();

    const radius = 1;

    const amountRows = 25;
    const amountCols = 25;

    const xStart = (1 / amountCols) * 0.5 * canvasWidth.current;
    const yStart = (1 / amountRows) * 0.5 * canvasHeight.current;

    affectedRadius.current = canvasWidth.current * 0.2;
    // mouseCircle.current = new MouseCircle(
    //   0,
    //   0,
    //   affectedRadius.current,
    //   context.current
    // );

    // Rows of dots
    for (let i = 0; i < amountRows; i++) {
      // Columns of dots
      for (let j = 0; j < amountCols; j++) {
        const circleX = xStart + j * (canvasWidth.current / amountCols);
        const circleY = yStart + i * (canvasHeight.current / amountRows);

        const circle = new Circle(circleX, circleY, radius, context.current);
        circlesArray.current.push(circle);
      }
    }
  }, []);

  function setCanvasSize() {
    if (!canvasEl?.current) return;
    // TODO: The scale sometimes need to be applied and sometimes not.... I
    // don't get it :(
    // const scale = window.devicePixelRatio;
    const scale = 1;

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

    const cWidth = innerWidth * scale;
    canvasWidth.current = cWidth;

    const cHeight = innerHeight * scale;
    canvasHeight.current = cHeight;

    const canvasDimensions = canvasEl.current.getBoundingClientRect();

    canvasX.current = canvasDimensions.x;
    canvasY.current = canvasDimensions.y;

    canvasEl.current.style.width = `${innerWidth}px`;
    canvasEl.current.width = cWidth;
    canvasEl.current.style.height = `${innerHeight}px`;
    canvasEl.current.height = cHeight;
  }

  function addListener() {
    canvasEl.current.addEventListener("mousemove", handleMouseMove);
    animFrame.current = requestAnimationFrame(animateCircles);
  }

  function removeListener() {
    canvasEl.current.removeEventListener("mousemove", handleMouseMove);
  }

  function handleMouseMove(e) {
    xInCanvas.current = e.pageX - canvasX.current;
    yInCanvas.current = e.pageY - canvasY.current;
  }

  function animateCircles() {
    requestAnimationFrame(animateCircles);
    context.current.clearRect(0, 0, canvasWidth.current, canvasHeight.current);
    // mouseCircle.current.update();
    for (let i = 0; i < circlesArray.current.length; i++) {
      circlesArray.current[i].update();
    }
  }

  function MouseCircle(x, y, radius, context) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.draw = function () {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      context.fillStyle = "rgba(0,0,0,0.3)";
      context.strokeStyle = "rgba(255,0,0,1)";
      context.fill();
      context.stroke();
    };

    this.update = function () {
      this.x = xInCanvas.current;
      this.y = yInCanvas.current;
      this.draw();
    };
  }

  function Circle(x, y, radius, context) {
    this.x = x;
    this.y = y;
    this.minRadius = radius;
    this.currentRadius = radius;
    this.currentMaxRadius = radius;
    this.maxRadius = radius;

    this.originalOpacity = 0.75;
    this.currentOpacity = this.originalOpacity;

    this.draw = function () {
      context.beginPath();
      context.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
      context.fillStyle = `rgba(250,255,255,${this.currentOpacity})`;
      context.fill();
    };

    this.update = function () {
      const deltaX = this.x - xInCanvas.current;
      const deltaY = this.y - yInCanvas.current;
      const radiiSum = affectedRadius.current + this.currentRadius;

      const distanceSquared = deltaX * deltaX + deltaY * deltaY;
      if (distanceSquared <= radiiSum * radiiSum) {
        //The lower this percentage, the closer to the center so the bigger we
        //allow the circle to grow.
        const percentageFromCenter = distanceSquared / (radiiSum * radiiSum);
        const test = radius * 7 * (1 - percentageFromCenter);
        this.maxRadius = test;

        const newRadius = Math.max(
          this.minRadius,
          Math.min(this.maxRadius, this.currentRadius + radius * 0.75)
        );
        const newOpacity = Math.min(1, this.currentOpacity + 0.01);
        this.currentRadius = newRadius;
        this.currentOpacity = newOpacity;
      } else {
        const newRadius = Math.max(
          this.minRadius,
          this.currentRadius - radius * 0.5
        );
        const newOpacity = Math.max(
          this.originalOpacity,
          this.currentOpacity - 0.01
        );
        this.currentRadius = newRadius;
        this.currentOpacity = newOpacity;
      }

      this.draw();
    };

    this.draw();
  }

  return (
    <section className={style.section}>
      <h1 className={style.heading}>Drink your health potion</h1>
      <canvas
        ref={canvasEl}
        className={style.canvas}
        onMouseEnter={addListener}
        onMouseLeave={removeListener}
      ></canvas>
    </section>
  );
}
