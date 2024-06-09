const MIN_ROWS = 5;
const MAX_ROWS = 12;
const MIN_COLS = 7;
const MAX_COLS = 20;
const COLS_SKEW = 2;
const MAX_ANGLE = 90;

const drawLine = (ctx, from, to) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
};

const drawRectangle = (ctx, from, to) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  ctx.beginPath();
  ctx.rect(fromX, fromY, toX - fromX, toY - fromY);
  ctx.stroke();
};

const randNormal = (min, max, skew) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randNormal(min, max, skew);
  // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
};

const randomIntBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomIntBetweenNormal = (min, max) =>
  Math.floor(randNormal(0, 1, COLS_SKEW) * (max - min + 1) + min);

const calculateRowHeight = (heightLeft, rowsLeft) => {
  if (rowsLeft == 1) return heightLeft;
  const averageHeight = parseInt(heightLeft / rowsLeft);
  const lowBound = parseInt(averageHeight * 0.8);
  const highBound = parseInt(averageHeight * 1.2);
  return randomIntBetween(lowBound, highBound);
};

const drawMark = (ctx, from, to) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  const MARK_LENGTH = 5;
  const slope = -1 / ((fromY - toY) / (fromX - toX));
  const midPointX = (toX + fromX) / 2;
  const midPointY = (toY + fromY) / 2;

  const changeInX = Math.sqrt(
    (MARK_LENGTH * MARK_LENGTH) / (1 + slope * slope)
  );
  const changeInY = slope * changeInX;

  drawLine(
    ctx,
    [midPointX - changeInX, midPointY - changeInY],
    [midPointX + changeInX, midPointY + changeInY]
  );
};

const drawVerticalMarkUp = (ctx, from, to) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  const MARK_LENGTH = 5;

  const midPointX = (toX + fromX) / 2;
  const midPointY = (toY + fromY) / 2;

  drawLine(ctx, [midPointX, midPointY], [midPointX, midPointY + MARK_LENGTH]);
};


const drawVerticalMarkDown = (ctx, from, to) => {
    const [fromX, fromY] = from;
    const [toX, toY] = to;
  
    const MARK_LENGTH = 5;
  
    const midPointX = (toX + fromX) / 2;
    const midPointY = (toY + fromY) / 2;
  
    drawLine(ctx, [midPointX, midPointY], [midPointX, midPointY - MARK_LENGTH]);
  };


window.onload = function () {
  const canvas = document.querySelector("#draw");
  const ctx = canvas.getContext("2d");

  ctx.canvas.width = document.body.offsetWidth;
  ctx.canvas.height = document.body.offsetHeight;

  drawRectangle(ctx, [0, 0], [ctx.canvas.width, ctx.canvas.height]);

  const rows = randomIntBetween(MIN_ROWS, MAX_ROWS);

  let currentHeight = 0;
  let previousHeight = 0;
  for (let i = 0; i < rows; i++) {
    const rowHeight = calculateRowHeight(
      ctx.canvas.height - currentHeight,
      rows - i
    );
    drawLine(
      ctx,
      [0, rowHeight + currentHeight],
      [ctx.canvas.width, rowHeight + currentHeight]
    );

    const angle = randomIntBetweenNormal(20, MAX_ANGLE);
    const colWidth = Math.tan((angle / 180.0) * Math.PI) * rowHeight;

    let previousWidth = 0;
    currentHeight += rowHeight

    while (previousWidth < ctx.canvas.width) {
      drawLine(
        ctx,
        [previousWidth, previousHeight],
        [previousWidth + colWidth, currentHeight]
      );

      // line marks
      drawMark(
        ctx,
        [previousWidth, previousHeight],
        [previousWidth + colWidth, currentHeight]
      );

      // top mark
      drawVerticalMarkUp(
        ctx,
        [previousWidth, previousHeight],
        [previousWidth + colWidth, previousHeight]
      );

      // bottom mark
      drawVerticalMarkDown(
        ctx,
        [previousWidth, currentHeight],
        [previousWidth + colWidth, currentHeight]
      );

      previousWidth += colWidth;
    }

    previousHeight = currentHeight;
  }
};
