import React, { useEffect, useRef } from 'react';
import { SkinViewer, IdleAnimation, WalkingAnimation } from 'skinview3d';

const AccountSkinViewer = ({ skinUrl, width = 300, height = 400 }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize the viewer
        try {
            const viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: width,
                height: height,
                skin: skinUrl,
            });

            // Set animation if available, otherwise just render
            // Use WalkingAnimation paused as a fallback for a natural pose if Idle is missing
            if (typeof IdleAnimation !== 'undefined') {
                viewer.animation = new IdleAnimation();
                viewer.animation.paused = true;
            } else if (typeof WalkingAnimation !== 'undefined') {
                viewer.animation = new WalkingAnimation();
                viewer.animation.paused = true;
            }

            // Adjust controls - disable zoom if desired
            viewer.controls.enableZoom = false;
            
            // Center the model for the Account Page
            // Lower value for y moves the camera look-at point down, which moves the model UP in the frame
            viewer.controls.target.y = -2; 
            viewer.zoom = 0.9;
            viewer.camera.position.z = 50;

            viewerRef.current = viewer;
        } catch (error) {
            console.error("Failed to initialize SkinViewer", error);
        }

        // Cleanup
        return () => {
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
        };
    }, [skinUrl, width, height]);

    return (
        <div className="account-skin-viewer-container" style={{ width: width, height: height, position: 'relative', zIndex: 2 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default AccountSkinViewer;
