// ------------------------------------------------------
// TIME WITH YOUR BODY
// flowing text / hair strand version
// p5.js 2.x
// ------------------------------------------------------


// ------------------------------------------------------
// POEM
// ------------------------------------------------------

const POEM_BLOCKS = [
  {
    role: "title",
    text: "Time with your Body"
  },

  {
    role: "body",
    text: "You combed my hair and it grew long within seconds, folded locks into velvet ruffles, cut it off and threw it over the balcony. You started combing my hair again, it grew again, stout and blonde. You cut it once more. Flung. Cold hand cusping air and when faced with coincidence it is always god."
  },

  {
    role: "body",
    text: "I speak to you in unadorned American English."
  },

  {
    role: "body",
    text: "We came across a sprawled dead swan on our walk along a lake. Bare feet on refrigerated moss. Noodle necked back of head placed on earth, wings sprawled open, belly up, stench of wet feathers. A solo funeral, turned three, I forgot my lipstick."
  },

  {
    role: "body",
    text: "Jelly beans in sidewalk cracks, you stop to eat treasure. Pantry of expensive tins: italian sardines, tomatoes, mushrooms— with a 2022 expiration date, rancid. Her shoulders lay on quilted hospital bed and lilacs, picked today, tucked in for sleep."
  },

  {
    role: "body",
    text: "Reconstruct me, contour and ligament pulsing blood. Those two large cat eyes, the ones where no one knows if they are hazel or blue or brown. Maybe green. Drill into my bone, fingers first follow the pearl necklace of the spine. Shape thighs onto paper and origami legs open."
  },

  {
    role: "body",
    text: "That summer we tried to read together but ended up kissing."
  },

  {
    role: "body",
    text: "The first woman I saw naked I thought of my mother. Brown nipples and dark hair, mom"
  },

  {
    role: "body",
    text: "naked in the shower using her hand to smudge away the steam from the glass door, smiling asking"
  },

  {
    role: "italic",
    text: "what do you need?"
  },

  {
    role: "body",
    text: "Every night since she passed, I hold her rib, a teddy bear."
  }
];


// ------------------------------------------------------
// FONT
// ------------------------------------------------------

const FONT_NAME = "Syne";


// ------------------------------------------------------
// TYPOGRAPHY
// ------------------------------------------------------

// Proportional extra spacing.
// 0.08 = add 8% of each glyph's width.
const LETTER_SPACING_RATIO = 0.08;

// Extra space between words, relative to font size.
const WORD_SPACING_EM = 0.20;


// ------------------------------------------------------
// MOTION
// ------------------------------------------------------

// Whole strand drifting
const WIND_X = 10;
const WIND_Y = 5;

// Smaller waves traveling through strand
const RIPPLE_X = 4;
const RIPPLE_Y = 7;

// Slow larger gust
const GUST_X = 15;
const GUST_Y = 8;

// Higher = left side stays more firmly anchored
const ANCHOR_POWER = 1.7;

// Long wave through each completed line
const LONG_WAVE_X = 5;
const LONG_WAVE_Y = 9;


// ------------------------------------------------------
// GLOBALS
// ------------------------------------------------------

let glyphs = [];
let lines = [];

let revealedCount = 0;
let nextRevealTime = 0;

let layoutReady = false;

let marginX = 90;
let topMargin = 70;

let maxTextWidth = 860;

let bodySize = 22;
let bodyLeading = 44;

let titleSize = 34;
let titleLeading = 52;


// ------------------------------------------------------
// SETUP
// ------------------------------------------------------

function setup() {

  // IMPORTANT:
  // fixed canvas size = no resizeCanvas recursion
  //
  // Refresh the sketch if you manually resize the browser.

  let canvasHeight =
    windowWidth < 700
      ? 3200
      : 2000;

  createCanvas(
    windowWidth,
    canvasHeight
  );

  textAlign(LEFT, TOP);

  // Wait until Google Font is actually available
  document.fonts.ready.then(() => {

    textFont(FONT_NAME);

    rebuildLayout();

    restartReveal();

    layoutReady = true;
  });
}


// ------------------------------------------------------
// DRAW
// ------------------------------------------------------

function draw() {

  background(
    244,
    241,
    236
  );

  if (!layoutReady) {
    return;
  }

  updateReveal();

  const states =
    computeVisibleStates();

  drawFilaments(states);

  drawGlyphs(states);

  drawUI();
}


// ------------------------------------------------------
// LAYOUT
// ------------------------------------------------------

function rebuildLayout() {

  glyphs = [];
  lines = [];


  const isNarrow =
    width < 700;


  if (isNarrow) {

    marginX = 28;
    topMargin = 38;

    bodySize = 18;
    bodyLeading = 37;

    titleSize = 27;
    titleLeading = 44;

  } else {

    marginX = 90;
    topMargin = 70;

    bodySize = 22;
    bodyLeading = 44;

    titleSize = 34;
    titleLeading = 52;
  }


  maxTextWidth = min(
    width - marginX * 2,
    860
  );


  let y = topMargin;


  POEM_BLOCKS.forEach(
    block => {

      const styleInfo =
        getStyleInfo(
          block.role
        );


      const wrappedLines =
        wrapText(
          block.text,
          styleInfo.size,
          styleInfo.style,
          maxTextWidth
        );


      wrappedLines.forEach(
        lineText => {

          const lineIndex =
            lines.length;


          const lineObj = {

            role:
              block.role,

            baseY:
              y,

            size:
              styleInfo.size,

            style:
              styleInfo.style,

            charIndices:
              [],

            startIndex:
              glyphs.length,

            endIndex:
              glyphs.length,

            width:
              0,

            // gives every line slightly
            // different wind movement
            phase:
              random(TWO_PI)
          };


          textSize(
            styleInfo.size
          );

          textStyle(
            styleInfo.style
          );


          let x =
            marginX;


          Array.from(
            lineText
          ).forEach(
            ch => {

              const w =
                textWidth(ch);


              let advance;


              if (ch === " ") {

                advance =
                  w +
                  styleInfo.size *
                  WORD_SPACING_EM;

              } else {

                advance =
                  w +
                  w *
                  LETTER_SPACING_RATIO;
              }


              const glyph = {

                char:
                  ch,

                baseX:
                  x,

                baseY:
                  y,

                w:
                  w,

                size:
                  styleInfo.size,

                style:
                  styleInfo.style,

                lineIndex:
                  lineIndex,

                charIndexInLine:
                  lineObj.charIndices.length,

                born:
                  -1
              };


              glyphs.push(
                glyph
              );


              lineObj
                .charIndices
                .push(
                  glyphs.length - 1
                );


              x +=
                advance;
            }
          );


          lineObj.endIndex =
            glyphs.length - 1;


          lineObj.width =
            x - marginX;


          lines.push(
            lineObj
          );


          y +=
            styleInfo.leading;
        }
      );


      y +=
        styleInfo.paragraphGap;
    }
  );
}


// ------------------------------------------------------
// TEXT STYLES
// ------------------------------------------------------

function getStyleInfo(role) {

  if (role === "title") {

    return {

      size:
        titleSize,

      leading:
        titleLeading,

      style:
        NORMAL,

      paragraphGap:
        30
    };
  }


  if (role === "italic") {

    return {

      size:
        bodySize,

      leading:
        bodyLeading,

      style:
        ITALIC,

      paragraphGap:
        26
    };
  }


  return {

    size:
      bodySize,

    leading:
      bodyLeading,

    style:
      NORMAL,

    paragraphGap:
      26
  };
}


// ------------------------------------------------------
// WORD WRAPPING
// ------------------------------------------------------

function wrapText(
  str,
  size,
  style,
  allowedWidth
) {

  textSize(size);
  textStyle(style);


  const words =
    str.split(" ");


  const result = [];

  let current =
    "";


  words.forEach(
    word => {

      const test =
        current === ""
          ? word
          : current + " " + word;


      if (
        measureText(
          test,
          size,
          style
        ) <= allowedWidth
      ) {

        current =
          test;

      } else {

        if (
          current !== ""
        ) {

          result.push(
            current
          );
        }


        current =
          word;
      }
    }
  );


  if (
    current !== ""
  ) {

    result.push(
      current
    );
  }


  return result;
}


// ------------------------------------------------------
// MEASURE TEXT
// ------------------------------------------------------

function measureText(
  str,
  size,
  style
) {

  textSize(size);
  textStyle(style);


  let total =
    0;


  Array.from(str).forEach(
    ch => {

      const w =
        textWidth(ch);


      if (
        ch === " "
      ) {

        total +=

          w +

          size *
          WORD_SPACING_EM;

      } else {

        total +=

          w +

          w *
          LETTER_SPACING_RATIO;
      }
    }
  );


  return total;
}


// ------------------------------------------------------
// REVEAL
// ------------------------------------------------------

function restartReveal() {

  revealedCount =
    0;


  glyphs.forEach(
    g => {

      g.born =
        -1;
    }
  );


  nextRevealTime =
    millis() +
    800;
}


// ------------------------------------------------------
// REVEAL UPDATE
// ------------------------------------------------------

function updateReveal() {

  if (
    revealedCount >=
    glyphs.length
  ) {

    return;
  }


  if (
    millis() >=
    nextRevealTime
  ) {

    const g =
      glyphs[
        revealedCount
      ];


    g.born =
      millis();


    const ch =
      g.char;


    revealedCount++;


    nextRevealTime =

      millis() +

      getRevealDelay(ch);
  }
}


// ------------------------------------------------------
// REVEAL SPEED
// ------------------------------------------------------

function getRevealDelay(ch) {

  if (
    ch === " "
  ) {

    return random(
      55,
      110
    );
  }


  if (
    ch === ","
  ) {

    return random(
      300,
      500
    );
  }


  if (
    ch === "." ||
    ch === "?" ||
    ch === "!"
  ) {

    return random(
      900,
      1500
    );
  }


  if (
    ch === ":" ||
    ch === ";" ||
    ch === "—"
  ) {

    return random(
      480,
      850
    );
  }


  return random(
    160,
    340
  );
}


// ------------------------------------------------------
// CALCULATE MOTION
// ------------------------------------------------------

function computeVisibleStates() {

  const states =
    new Array(
      glyphs.length
    );


  const t =
    millis() *
    0.001;


  lines.forEach(
    (lineObj, lineIndex) => {

      const visibleCount =
        constrain(

          revealedCount -
          lineObj.startIndex,

          0,

          lineObj
            .charIndices
            .length
        );


      if (
        visibleCount <= 0
      ) {

        return;
      }


      const lineLength =
        lineObj
          .charIndices
          .length;


      const isActive =

        visibleCount >
        0

        &&

        visibleCount <
        lineLength;


      const lineProgress =

        lineLength <= 1
          ? 1
          : visibleCount /
            lineLength;


      // ------------------------------------------
      // WHOLE STRAND WIND
      // ------------------------------------------

      const lineWindX =

        sin(
          t * 0.34 +
          lineObj.phase
        ) *
        WIND_X

        +

        sin(
          t * 0.14 +
          lineObj.phase * 1.8
        ) *
        WIND_X *
        0.65;


      const lineWindY =

        cos(
          t * 0.29 +
          lineObj.phase
        ) *
        WIND_Y

        +

        sin(
          t * 0.12 +
          lineObj.phase * 1.3
        ) *
        WIND_Y *
        0.6;


      // ------------------------------------------
      // SLOW GUST
      // ------------------------------------------

      const gustPhase =

        sin(
          t * 0.11 +
          lineObj.phase * 2.2
        );


      const gustStrength =

        Math.sign(
          gustPhase
        )

        *

        pow(
          abs(gustPhase),
          1.6
        );


      const gustX =

        gustStrength *
        GUST_X;


      const gustY =

        sin(
          t * 0.09 +
          lineObj.phase * 1.6
        )

        *

        GUST_Y;


      const visibleIndices =

        lineObj
          .charIndices
          .slice(
            0,
            visibleCount
          );


      visibleIndices.forEach(
        (glyphIndex, j) => {

          const g =
            glyphs[
              glyphIndex
            ];


          const linePos =

            lineLength <= 1
              ? 0
              : j /
                (
                  lineLength -
                  1
                );


          // --------------------------------------
          // LEFT SIDE ANCHOR
          // --------------------------------------

          const anchorFactor =

            pow(
              linePos,
              ANCHOR_POWER
            );


          const anchoredWindX =

            (
              lineWindX +
              gustX
            )

            *

            anchorFactor;


          const anchoredWindY =

            (
              lineWindY +
              gustY
            )

            *

            anchorFactor;


          // --------------------------------------
          // LONG FLOWING WAVE
          // --------------------------------------

          const longWaveX =

            cos(

              linePos *
              PI *
              1.25

              -

              t *
              0.55

              +

              lineObj.phase

            )

            *

            LONG_WAVE_X

            *

            anchorFactor;


          const longWaveY =

            sin(

              linePos *
              PI *
              1.6

              -

              t *
              0.7

              +

              lineObj.phase

            )

            *

            LONG_WAVE_Y

            *

            anchorFactor;


          // --------------------------------------
          // SMALL RIPPLE
          // --------------------------------------

          const rippleX =

            sin(

              linePos *
              8.5

              -

              t *
              1.15

              +

              lineObj.phase

            )

            *

            RIPPLE_X

            *

            anchorFactor;


          const rippleY =

            cos(

              linePos *
              7

              -

              t *
              1.0

              +

              lineObj.phase

            )

            *

            RIPPLE_Y

            *

            anchorFactor;


          // --------------------------------------
          // ACTIVE TIP
          // --------------------------------------

          let trailingInfluence =
            0;


          if (
            isActive &&
            linePos <=
            lineProgress
          ) {

            trailingInfluence =

              constrain(

                1 -

                (
                  lineProgress -
                  linePos
                ) /
                0.30,

                0,

                1
              );
          }


          const ropeX =

            cos(

              t *
              1.8

              +

              linePos *
              8

              +

              lineObj.phase

            )

            *

            7

            *

            trailingInfluence

            *

            anchorFactor;


          const ropeY =

            sin(

              t *
              2

              +

              linePos *
              7

              +

              lineObj.phase

            )

            *

            13

            *

            trailingInfluence

            *

            anchorFactor;


          // --------------------------------------
          // NEW LETTER FADE / GROW
          // --------------------------------------

          const age =

            millis() -
            g.born;


          const opacity =

            constrain(

              map(
                age,
                0,
                520,
                0,
                255
              ),

              0,

              255
            );


          const birthT =

            constrain(

              age /
              850,

              0,

              1
            );


          const birthEase =

            1 -

            pow(
              1 - birthT,
              3
            );


          const growOffsetX =

            lerp(
              -7,
              0,
              birthEase
            );


          // --------------------------------------
          // FINAL POSITION
          // --------------------------------------

          states[
            glyphIndex
          ] = {

            x:

              g.baseX

              +

              anchoredWindX

              +

              longWaveX

              +

              rippleX

              +

              ropeX

              +

              growOffsetX,


            y:

              g.baseY

              +

              anchoredWindY

              +

              longWaveY

              +

              rippleY

              +

              ropeY,


            opacity:
              opacity
          };
        }
      );
    }
  );


  return states;
}


// ------------------------------------------------------
// CONNECTING STRAND
// ------------------------------------------------------

function drawFilaments(
  states
) {

  stroke(
    40,
    26
  );

  strokeWeight(
    0.45
  );

  noFill();


  lines.forEach(
    lineObj => {

      const visibleCount =

        constrain(

          revealedCount -
          lineObj.startIndex,

          0,

          lineObj
            .charIndices
            .length
        );


      if (
        visibleCount <
        2
      ) {

        return;
      }


      let previous =
        null;


      lineObj
        .charIndices
        .slice(
          0,
          visibleCount
        )
        .forEach(
          glyphIndex => {

            const g =
              glyphs[
                glyphIndex
              ];


            const s =
              states[
                glyphIndex
              ];


            if (
              !s ||
              g.char === " "
            ) {

              return;
            }


            const strandPoint = {

              x:

                s.x +
                g.w *
                0.5,

              y:

                s.y +
                g.size *
                0.58
            };


            if (
              previous
            ) {

              line(

                previous.x,
                previous.y,

                strandPoint.x,
                strandPoint.y
              );
            }


            previous =
              strandPoint;
          }
        );
    }
  );
}


// ------------------------------------------------------
// DRAW GLYPHS
// ------------------------------------------------------

function drawGlyphs(
  states
) {

  noStroke();


  glyphs
    .slice(
      0,
      revealedCount
    )
    .forEach(
      (g, i) => {

        const s =
          states[i];


        if (!s) {
          return;
        }


        textSize(
          g.size
        );


        textStyle(
          g.style
        );


        fill(
          20,
          s.opacity
        );


        text(

          g.char,

          s.x,

          s.y
        );
      }
    );
}


// ------------------------------------------------------
// UI
// ------------------------------------------------------

function drawUI() {

  textStyle(
    NORMAL
  );

  textSize(
    11
  );

  fill(
    110,
    110
  );

  noStroke();


  text(

    "click to restart",

    marginX,

    height - 30
  );
}


// ------------------------------------------------------
// CLICK TO RESTART
// ------------------------------------------------------

function mousePressed() {

  if (
    layoutReady
  ) {

    restartReveal();
  }
}