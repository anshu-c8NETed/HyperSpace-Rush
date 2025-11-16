import * as THREE from 'three';

// Realistic racing track inspired by real racetracks like Spa-Francorchamps and Nürburgring
// Smoother curves, realistic banking, and gradual elevation changes
const curvePath = [
    // Starting straight - gentle introduction
    15.0, 0.0, 0.0,
    12.0, 0.0, 0.0,
    9.0, 0.0, 0.0,
    
    // Gentle right-hand curve (Turn 1)
    6.0, 0.0, -1.5,
    3.5, 0.0, -3.5,
    1.5, 0.0, -6.0,
    
    // Short straight
    0.0, 0.0, -9.0,
    0.0, 0.1, -12.0,
    
    // Sweeping left with slight elevation (Turn 2)
    -1.5, 0.3, -14.0,
    -3.5, 0.5, -15.5,
    -6.0, 0.6, -16.0,
    
    // Fast section with gentle curves
    -8.5, 0.5, -15.5,
    -11.0, 0.4, -14.0,
    -13.0, 0.2, -12.0,
    
    // Downhill into hairpin (Turn 3)
    -14.5, 0.0, -9.5,
    -15.0, -0.3, -7.0,
    -14.8, -0.5, -4.5,
    
    // Hairpin apex
    -13.5, -0.5, -2.5,
    -11.5, -0.4, -1.0,
    -9.0, -0.2, -0.5,
    
    // Acceleration zone
    -6.5, 0.0, -0.2,
    -4.0, 0.1, 0.0,
    -1.5, 0.2, 0.5,
    
    // S-curves section (Turns 4-5)
    1.0, 0.3, 1.5,
    3.0, 0.4, 3.0,
    4.5, 0.5, 5.0,
    
    5.0, 0.6, 7.0,
    4.5, 0.7, 9.0,
    3.0, 0.8, 10.5,
    
    // Uphill section
    1.0, 1.0, 11.5,
    -1.5, 1.3, 12.0,
    -4.0, 1.6, 11.8,
    
    // Crest and fast downhill (Turn 6)
    -6.5, 1.8, 11.0,
    -8.5, 1.7, 9.5,
    -10.0, 1.4, 7.5,
    
    -11.0, 1.0, 5.5,
    -11.5, 0.6, 3.5,
    -11.3, 0.3, 1.5,
    
    // Medium-speed right-hander (Turn 7)
    -10.5, 0.1, -0.5,
    -9.0, 0.0, -2.0,
    -7.0, 0.0, -3.0,
    
    // Technical section with multiple apexes
    -5.0, 0.0, -3.5,
    -3.0, 0.1, -3.8,
    -1.0, 0.2, -3.5,
    
    1.0, 0.2, -3.0,
    3.0, 0.1, -2.0,
    5.0, 0.0, -0.8,
    
    // Fast sweeping curve (Turn 8)
    7.0, 0.0, 0.5,
    9.0, 0.1, 2.0,
    11.0, 0.2, 3.8,
    
    // Banking turn with elevation
    12.5, 0.4, 5.5,
    13.5, 0.6, 7.5,
    14.0, 0.7, 9.5,
    
    // Back straight approach
    14.2, 0.6, 11.5,
    14.0, 0.4, 13.5,
    13.5, 0.2, 15.0,
    
    // Final corner complex (Turns 9-10)
    12.5, 0.1, 16.0,
    11.0, 0.0, 16.5,
    9.0, 0.0, 16.3,
    
    7.0, 0.0, 15.5,
    5.5, 0.0, 14.0,
    4.5, 0.0, 12.0,
    
    // Back onto main straight
    4.0, 0.0, 10.0,
    4.5, 0.0, 8.0,
    5.5, 0.0, 6.0,
    
    7.0, 0.0, 4.5,
    9.0, 0.0, 3.5,
    11.5, 0.0, 2.8,
    
    13.5, 0.0, 2.0,
    15.0, 0.0, 1.0,
    15.0, 0.0, 0.0
];

// Construct racing track with smooth transitions
const points = [];
for (let i = 0; i < curvePath.length; i += 3) {
    points.push(
        new THREE.Vector3(
            curvePath[i + 0],
            curvePath[i + 1],
            curvePath[i + 2]
        )
    );
}

// Smooth spline with moderate tension for realistic racing feel
// tension = 0.5 gives smooth, flowing corners like real racetracks
const spline = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);

export default spline;