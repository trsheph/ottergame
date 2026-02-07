import React, { useState, useEffect, useRef } from 'react';

const OtterGame = () => {
  // ========== DIFFICULTY SETTINGS - ADJUST THESE ==========
  const DIFFICULTY_CONFIG = {
    baseSpawnInterval: 1200,      // Base time between spawns (lower = more objects)
    score100SpawnInterval: 800,   // Spawn interval at score 100 (50% more trash)
    score200SpawnInterval: 600,   // Spawn interval at score 200 (2x more trash)
  };
  // ========================================================
  
  const canvasRef = useRef(null);
  const [score, setScore] = useState(50);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const [images, setImages] = useState({
    background: null,
    otter: null,
    fish1: null,
    fish2: null,
    trash1: null,
    trash2: null,
    trash3: null,
    trash4: null,
    trash5: null,
    trash6: null
  });

  const gameStateRef = useRef({
    otterY: 0,
    velocity: 0,
    objects: [],
    lastSpawn: 0,
    factOffset: 800,
    backgroundOffset: 0
  });

  const otterFacts = [
    "Sea otters hold hands while sleeping to keep from drifting apart! 🦦",
    "Otters have the densest fur of any animal - up to 1 million hairs per square inch!",
    "Sea otters use rocks as tools to crack open shellfish - they're one of the few animals to use tools!",
    "A group of otters is called a 'raft' when they're in the water!",
    "Sea otters eat 25% of their body weight every day to stay warm!",
    "Baby otters can't swim at first - their fur is too buoyant and they float like corks!",
    "The ocean covers 71% of Earth's surface and contains 97% of Earth's water!",
    "More than 80% of the ocean has never been mapped or explored!",
    "Otters are a keystone species - they help maintain healthy kelp forests!",
    "Sea otters can live their entire lives without leaving the water!",
    "14 billion pound of garbage are dumped into the ocean every year, and that number will only increase if nothing is done.",
    "100,000 animals die every year from entangalment in trash.",
    "by 2050, the ocean will have more trash than fish by weight.",
    "the great garbage patch is twice the size of texas as of now.",
    "About 10% of Americas beaches fail to meet the federal benchmark for what constitutes safe swimming water.",
    "The Mississippi River carries an estimated 1.5 million metric tons of nitrogen pollution into the Gulf of Mexico each year.",
    "Over 5.25 Trillion Pieces of Plastic Trash Are in Our Oceans.",
    "Over 1 million seabirds and 100,000 sea mammals are killed by pollution every year.",
    "Approximately 40% of the lakes in America are too polluted for fishing, aquatic life, or swimming."
  ];

  // Load images from public folder on mount
  useEffect(() => {
    const imageKeys = ['background', 'otter', 'fish1', 'fish2', 'trash1', 'trash2', 'trash3', 'trash4', 'trash5', 'trash6'];
    const loadedImages = {};
    let loadCount = 0;

    imageKeys.forEach(key => {
      const img = new Image();
      img.onload = () => {
        loadedImages[key] = img;
        loadCount++;
        if (loadCount === imageKeys.length) {
          setImages(loadedImages);
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${key}`);
        loadCount++;
        if (loadCount === imageKeys.length) {
          setImagesLoaded(true);
        }
      };
      img.src = `/images/${key}.png`;
    });
  }, []);

  useEffect(() => {
    if (score <= 0 && gameStarted && !gameOver) {
      setGameOver(true);
      setFinalTime(time);
    }
  }, [score, gameStarted, gameOver, time]);

  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTime(t => t + 0.01);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 600;
    
    gameStateRef.current.otterY = height / 2;
    
    let animationId;
    let startTime = null;

    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      if (e.key === 'q' || e.key === 'Q') {
        setGameOver(true);
        setFinalTime(time);
        return;
      }
      
      if (e.key === 'ArrowUp') {
        gameStateRef.current.velocity = -5;
      } else if (e.key === 'ArrowDown') {
        gameStateRef.current.velocity = 5;
      }
      if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        setGameStarted(true);
        startTime = performance.now();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        gameStateRef.current.velocity = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const spawnObject = (timestamp) => {
      // Calculate spawn interval based on score
      let spawnInterval;
      if (score >= 200) {
        spawnInterval = DIFFICULTY_CONFIG.score200SpawnInterval;
      } else if (score >= 100) {
        // Interpolate between score100 and score200 intervals
        const progress = (score - 100) / 100;
        spawnInterval = DIFFICULTY_CONFIG.score100SpawnInterval - 
          (DIFFICULTY_CONFIG.score100SpawnInterval - DIFFICULTY_CONFIG.score200SpawnInterval) * progress;
      } else {
        // Interpolate between base and score100 intervals
        const progress = score / 100;
        spawnInterval = DIFFICULTY_CONFIG.baseSpawnInterval - 
          (DIFFICULTY_CONFIG.baseSpawnInterval - DIFFICULTY_CONFIG.score100SpawnInterval) * progress;
      }
      
      if (timestamp - gameStateRef.current.lastSpawn > spawnInterval) {
        const isFood = Math.random() > 0.92;
        const trashTypes = ['trash1', 'trash2', 'trash3', 'trash4', 'trash5', 'trash6'];
        const fishTypes = ['fish1', 'fish2'];
        
        gameStateRef.current.objects.push({
          x: width,
          y: Math.random() * (height - 150) + 50,
          speed: (2 + Math.random() * 3.3) * 1.05,
          isFood: isFood,
          size: isFood ? 60 : 56.25,
          imageKey: isFood ? fishTypes[Math.floor(Math.random() * 2)] : trashTypes[Math.floor(Math.random() * 6)]
        });
        gameStateRef.current.lastSpawn = timestamp;
      }
    };

    const checkCollision = (obj) => {
      const otterX = width / 3;
      const otterY = gameStateRef.current.otterY;
      const otterSize = 50;
      
      const dx = obj.x - otterX;
      const dy = obj.y - otterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < (otterSize + obj.size) / 2.5;
    };

    const gameLoop = (timestamp) => {
      
      // Update background scroll
      if (gameStarted && !gameOver) {
        gameStateRef.current.backgroundOffset -= 1;
        if (gameStateRef.current.backgroundOffset <= -width) {
          gameStateRef.current.backgroundOffset = 0;
        }
      }
      
      // Draw background
      if (images.background) {
        ctx.drawImage(images.background, gameStateRef.current.backgroundOffset, 0, width, height);
        ctx.drawImage(images.background, gameStateRef.current.backgroundOffset + width, 0, width, height);
      } else {
        ctx.fillStyle = '#1e90ff';
        ctx.fillRect(0, 0, width, height);
      }

      if (gameStarted && !gameOver) {
        // Update otter position
        gameStateRef.current.otterY += gameStateRef.current.velocity;
        gameStateRef.current.otterY = Math.max(30, Math.min(height - 80, gameStateRef.current.otterY));

        // Spawn objects
        spawnObject(timestamp);

        // Update and draw objects
        gameStateRef.current.objects = gameStateRef.current.objects.filter(obj => {
          obj.x -= obj.speed;
          
          if (checkCollision(obj)) {
            if (obj.isFood) {
              setScore(s => s + 15);
            } else {
              setScore(s => s - 10);
            }
            return false;
          }
          
          if (obj.x < -50) return false;
          
          // Draw object
          const img = images[obj.imageKey];
          if (img) {
            ctx.drawImage(img, obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size);
          }
          
          return true;
        });
      }

      // Draw otter
      const otterX = width / 3;
      const otterY = gameStateRef.current.otterY;
      
      if (images.otter) {
        ctx.drawImage(images.otter, otterX - 52.5, otterY - 37.5, 105, 75);
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(otterX, otterY, 40, 25, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, height / 2 - 60, width, 120);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press ↑ or ↓ to Start!', width / 2, height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Collect fish, avoid trash! Press Q to quit.', width / 2, height / 2 + 40);
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 30);
        ctx.font = '32px Arial';
        ctx.fillText(`Final Time: ${finalTime.toFixed(2)}s`, width / 2, height / 2 + 30);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [imagesLoaded, gameStarted, gameOver, finalTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        gameStateRef.current.factOffset -= 2;
        if (gameStateRef.current.factOffset < -800) {
          gameStateRef.current.factOffset = 800;
        }
      }
    }, 30);
    return () => clearInterval(interval);
  }, [gameOver]);

  const currentFact = otterFacts[Math.floor(Date.now() / 10000) % otterFacts.length];

  if (!imagesLoaded) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1e3a8a',
        padding: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center'
          }}>Loading Otter Game...</h1>
          <p style={{
            textAlign: 'center',
            color: '#4b5563'
          }}>Make sure images are in the /public/images/ folder</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1e3a8a',
      padding: '16px'
    }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas 
          ref={canvasRef} 
          style={{
            border: '4px solid #1d4ed8',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          Score: {score}
        </div>
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          Time: {time.toFixed(2)}s
        </div>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: 'black',
        color: 'white',
        padding: '8px 0',
        overflow: 'hidden',
        marginTop: '8px',
        height: '40px'
      }}>
        <div style={{
          whiteSpace: 'nowrap',
          fontSize: '16px',
          fontWeight: '600',
          transform: `translateX(${gameStateRef.current.factOffset}px)`,
          lineHeight: '40px'
        }}>
          {currentFact}
        </div>
      </div>
    </div>
  );
};

export default OtterGame;
