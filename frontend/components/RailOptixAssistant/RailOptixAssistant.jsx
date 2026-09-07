"use client";

import { useState } from "react";
import "./RailOptixAssistant.css";

export default function RailOptixAssistant({
  onComplete,
  onSkip,
}) {
  const [step, setStep] = useState(0);
  const [departing, setDeparting] = useState(false);

  const messages = [
    {
      kicker: "WELCOME TO RAILOPTIX",
      title:
        "Let me show you what happens behind a railway decision.",
      description:
        "Before a train moves, many decisions happen behind the scenes. Assets, maintenance, inspections, and operations all have to work together.",
    },
    {
      kicker: "MAINTENANCE",
      title:
        "Each block of the train represents a railway point.",
      description:
        "Think of every block as a point in the railway network. Behind each point are assets with their own maintenance requirements, condition, and schedule.",
    },
    {
      kicker: "INSPECTION",
      title:
        "Now we need to understand the condition of each point.",
      description:
        "Inspection results and asset-condition data tell us what is really happening on the ground and help identify where maintenance attention is needed most.",
    },
    {
      kicker: "AVAILABILITY",
      title:
        "But we cannot maintain every point at the same time.",
      description:
        "A railway point cannot simply be taken out of service whenever maintenance is required. Operational commitments, available blocks, and asset availability must be protected.",
    },
    {
      kicker: "OPTIMIZATION",
      title:
        "So which point should be planned first?",
      description:
        "RailOptix brings maintenance needs, inspection data, asset conditions, available blocks, and operational constraints together to find a smarter maintenance plan.",
    },
    {
      kicker: "RAILOPTIX",
      title:
        "You bring the railway data. I’ll help make sense of it.",
      description:
        "RailOptix turns complex railway information into clearer decisions, helping planners understand what needs attention and when.",
    },
  ];

  const currentMessage = messages[step];

  /*
   * Next button
   *
   * Step 0 -> Step 1:
   * Train enters from the LEFT.
   *
   * Step 1 -> 2 -> 3 -> 4:
   * Train stays in place.
   *
   * Step 4 -> Step 5:
   * Train exits completely to the RIGHT.
   */
  const handleNext = () => {
    if (step === 4) {
      setDeparting(true);

      window.setTimeout(() => {
        setDeparting(false);
        setStep(5);
      }, 2500);

      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleEnter = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      className={`rail-assistant-overlay ${
        step === 5 ? "final-state" : ""
      }`}
    >
      {/* Background */}
      <div className="rail-assistant-backdrop" />

      <div className="rail-assistant">

        {/* =====================================================
            SKIP
            ===================================================== */}

        <button
          type="button"
          className="assistant-skip"
          onClick={handleSkip}
          aria-label="Skip introduction"
        >
          <span>Skip</span>
          <span className="skip-x">×</span>
        </button>

        {/* =====================================================
            SCENE
            ===================================================== */}

        <div className="assistant-scene">

          <div className="scene-horizon" />

          {/* ===================================================
              RAILWAY TRACK
              =================================================== */}

          <div className="railway-track">
            <div className="track-rail rail-one" />
            <div className="track-rail rail-two" />

            <div className="sleepers">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
          </div>

          {/* ===================================================
              TRAIN
              
              IMPORTANT:
              The train is ALWAYS mounted.
              It starts off-screen on the LEFT.
              This prevents it from magically appearing.
              =================================================== */}

          <div
            className={`technical-train ${
              step === 0
                ? "train-waiting"
                : departing
                ? "train-departing"
                : "train-entered"
            }`}
          >

            {/* =================================================
                TRAIN FRONT
                ================================================= */}

            <div className="train-front">

              <div className="train-windshield">
                <div className="windshield-reflection" />
              </div>

              <div className="front-light light-one" />
              <div className="front-light light-two" />

              <div className="front-lower">
                <div className="front-grille" />
                <div className="front-shadow" />
              </div>

            </div>

            {/* =================================================
                POINT 01 — MAINTENANCE
                ================================================= */}

            <div
              className={`train-car point-one ${
                step === 1 ? "active-car" : ""
              }`}
            >

              <div className="car-roof" />

              <div className="car-window-row">
                <span />
                <span />
                <span />
              </div>

              <div className="car-door" />

              <div className="point-marker">
                <span>01</span>
              </div>

              <div className="car-bottom" />

              <div
                className={`car-point-label ${
                  step === 1 ? "active-point" : ""
                }`}
              >
                <span className="label-title">
                  MAINTENANCE
                </span>

                <span className="label-line" />

                <span className="label-number">
                  POINT 01
                </span>
              </div>

            </div>

            {/* =================================================
                POINT 02 — INSPECTION
                ================================================= */}

            <div
              className={`train-car point-two ${
                step === 2 ? "active-car" : ""
              }`}
            >

              <div className="car-roof" />

              <div className="car-window-row">
                <span />
                <span />
                <span />
              </div>

              <div className="car-door" />

              <div className="point-marker">
                <span>02</span>
              </div>

              <div className="car-bottom" />

              <div
                className={`car-point-label ${
                  step === 2 ? "active-point" : ""
                }`}
              >
                <span className="label-title">
                  INSPECTION
                </span>

                <span className="label-line" />

                <span className="label-number">
                  POINT 02
                </span>
              </div>

            </div>

            {/* =================================================
                POINT 03 — AVAILABILITY
                ================================================= */}

            <div
              className={`train-car point-three ${
                step === 3 ? "active-car" : ""
              }`}
            >

              <div className="car-roof" />

              <div className="car-window-row">
                <span />
                <span />
                <span />
              </div>

              <div className="car-door" />

              <div className="point-marker">
                <span>03</span>
              </div>

              <div className="car-bottom" />

              <div
                className={`car-point-label ${
                  step === 3 ? "active-point" : ""
                }`}
              >
                <span className="label-title">
                  AVAILABILITY
                </span>

                <span className="label-line" />

                <span className="label-number">
                  POINT 03
                </span>
              </div>

            </div>

            {/* =================================================
                POINT 04 — OPTIMIZATION
                ================================================= */}

            <div
              className={`train-car point-four ${
                step === 4 ? "active-car" : ""
              }`}
            >

              <div className="car-roof" />

              <div className="car-window-row">
                <span />
                <span />
                <span />
              </div>

              <div className="car-door" />

              <div className="point-marker">
                <span>04</span>
              </div>

              <div className="car-bottom" />

              <div
                className={`car-point-label ${
                  step === 4 ? "active-point" : ""
                }`}
              >
                <span className="label-title">
                  OPTIMIZATION
                </span>

                <span className="label-line" />

                <span className="label-number">
                  POINT 04
                </span>
              </div>

            </div>

            {/* =================================================
                UNDERCARRIAGE
                ================================================= */}

            <div className="train-undercarriage" />

            <div className="train-wheel wheel-one" />
            <div className="train-wheel wheel-two" />
            <div className="train-wheel wheel-three" />
            <div className="train-wheel wheel-four" />
            <div className="train-wheel wheel-five" />
            <div className="train-wheel wheel-six" />
            <div className="train-wheel wheel-seven" />
            <div className="train-wheel wheel-eight" />

          </div>

          {/* ===================================================
              GIRL MASCOT

              THIS IS THE ORIGINAL GIRL VERSION
              YOU SAID YOU LIKED.
              =================================================== */}

          <div
            className={`assistant-mascot ${
              step === 0
                ? "mascot-intro"
                : step === 5
                ? "mascot-final"
                : "mascot-hidden"
            }`}
          >

            <div className="mascot-glow" />

            <div className="mascot-character">

              {/* Hair */}

              <div className="mascot-hair">
                <div className="hair-side left" />
                <div className="hair-side right" />
              </div>

              {/* Head */}

              <div className="mascot-head">

                <div className="mascot-ear left" />
                <div className="mascot-ear right" />

                <div className="mascot-eye left" />
                <div className="mascot-eye right" />

                <div className="mascot-nose" />

                <div className="mascot-smile" />

              </div>

              {/* Neck */}

              <div className="mascot-neck" />

              {/* Body */}

              <div className="mascot-body">
                <div className="mascot-collar" />
                <div className="mascot-badge">
                  R
                </div>
              </div>

              {/* Arm */}

              <div className="mascot-arm" />

            </div>
          </div>

        </div>

        {/* =====================================================
            TEXT / CONTROLS
            ===================================================== */}

        <div className="assistant-message">

          {/* Progress */}

          <div className="message-progress">
            {messages.map((_, index) => (
              <span
                key={index}
                className={
                  index === step
                    ? "progress-active"
                    : ""
                }
              />
            ))}
          </div>

          {/* Kicker */}

          <div className="message-kicker">
            {currentMessage.kicker}
          </div>

          {/* Title */}

          <h1>
            {currentMessage.title}
          </h1>

          {/* Description */}

          <p>
            {currentMessage.description}
          </p>

          {/* Button */}

          <div className="message-action">

            {step < 5 ? (
              <button
                type="button"
                className="assistant-next"
                onClick={handleNext}
                disabled={departing}
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                className="assistant-enter"
                onClick={handleEnter}
              >
                <span>Enter RailOptix</span>
                <span>→</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}