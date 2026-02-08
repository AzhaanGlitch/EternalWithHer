// src/physics/rope.js
import Matter from "matter-js";

/**
 * Creates a physics-based rope using Matter.js
 * @param {Object} config - Configuration object
 * @param {number} config.x - X position of rope anchor
 * @param {number} config.y - Y position of rope anchor  
 * @param {number} config.segments - Number of rope segments (default: 8)
 * @param {number} config.segmentLength - Length of each segment (default: 20)
 * @param {number} config.stiffness - Constraint stiffness (default: 0.9)
 * @returns {Object} - Object containing rope composite and end body
 */
export function createRope({
  x,
  y,
  segments = 8,
  segmentLength = 20,
  stiffness = 0.9,
  damping = 0.1,
  ropeWidth = 8,
}) {
  const group = Matter.Body.nextGroup(true);
  const rope = Matter.Composite.create();
  const bodies = [];

  let prevBody = null;

  for (let i = 0; i < segments; i++) {
    const body = Matter.Bodies.rectangle(
      x,
      y + i * segmentLength,
      ropeWidth,
      segmentLength,
      {
        collisionFilter: { group },
        chamfer: { radius: 2 },
        density: 0.005,
        frictionAir: 0.02,
        restitution: 0.1,
      }
    );

    bodies.push(body);

    if (prevBody) {
      const constraint = Matter.Constraint.create({
        bodyA: prevBody,
        pointA: { x: 0, y: segmentLength / 2 },
        bodyB: body,
        pointB: { x: 0, y: -segmentLength / 2 },
        length: 0,
        stiffness,
        damping,
      });
      Matter.Composite.add(rope, constraint);
    }

    Matter.Composite.add(rope, body);
    prevBody = body;
  }

  return {
    rope,
    bodies,
    endBody: prevBody,
    firstBody: bodies[0],
  };
}

/**
 * Creates an anchor constraint for the rope
 * @param {Object} config - Configuration
 * @returns {Matter.Constraint} - The anchor constraint
 */
export function createRopeAnchor({
  x,
  y,
  ropeFirstBody,
  segmentLength,
}) {
  return Matter.Constraint.create({
    pointA: { x, y },
    bodyB: ropeFirstBody,
    pointB: { x: 0, y: -segmentLength / 2 },
    stiffness: 1,
    length: 0,
  });
}

/**
 * Creates a tassel/weight at the end of the rope
 * @param {Object} config - Configuration
 * @returns {Object} - Tassel body and constraint
 */
export function createTassel({
  ropeEndBody,
  segmentLength,
  radius = 20,
  group,
}) {
  const pos = ropeEndBody.position;

  const tassel = Matter.Bodies.circle(
    pos.x,
    pos.y + segmentLength / 2 + radius,
    radius,
    {
      collisionFilter: { group },
      density: 0.01,
      frictionAir: 0.02,
    }
  );

  const constraint = Matter.Constraint.create({
    bodyA: ropeEndBody,
    pointA: { x: 0, y: segmentLength / 2 },
    bodyB: tassel,
    pointB: { x: 0, y: -radius * 0.7 },
    stiffness: 0.9,
    length: 0,
  });

  return { tassel, constraint };
}
