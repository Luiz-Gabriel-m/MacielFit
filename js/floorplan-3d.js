/**
 * Studio Maciel - Interactive 3D Gym Floorplan (Three.js)
 * High-detail architectural 3D gym scene with realistic equipment models:
 * treadmills with consoles, spinning bikes with flywheels, multi-tier dumbbell racks,
 * smith machine, cable stations, reception desk with marble finish, lounge, and neon moss wall.
 */

class GymFloorplan3D {
  constructor() {
    this.container = document.getElementById('floorplan-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.markerMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activeZoneId = 'reception';
    this.animatingCamera = false;
    this.targetCameraPos = null;
    this.targetLookAt = null;

    this.zoneData = {
      reception: {
        id: 'reception',
        name: 'Recepção & Lounge VIP',
        category: 'Acolhimento & Check-in',
        color: '#D4AF37',
        pos: { x: -8, y: 1.8, z: 10 },
        cam: { x: -8, y: 12, z: 18 },
        look: { x: -8, y: 1, z: 10 },
        image: 'public/images/gallery/gym_facade.jpg',
        description: 'Entrada moderna com deck de madeira nobre, poltronas confortáveis para espera, balcão de mármore e controle de acesso biométrico inteligente.',
        equipment: 'Balcão de Atendimento em Mármore, Poltronas VIP, Catraca Digital, Climatização 18°C'
      },
      moss_wall: {
        id: 'moss_wall',
        name: 'Parede Verde Biofílica Instagramável',
        category: 'Ambiente & Identidade',
        color: '#2cd5eb',
        pos: { x: -14, y: 3.5, z: 0 },
        cam: { x: -6, y: 7, z: 6 },
        look: { x: -14, y: 3.2, z: 0 },
        image: 'public/images/gallery/gym_neon_moss.jpg',
        description: 'Nossa icônica parede de musgo verde natural com o letreiro neon dourado Studio Maciel. O ponto de encontro oficial para selfies, fotos pós-treino e registros da comunidade.',
        equipment: 'Vertical Moss Garden, Letreiro Neon Dourado Studio Maciel, Iluminação Cênica'
      },
      cardio: {
        id: 'cardio',
        name: 'Área Cardio & Spinning Supertech',
        category: 'Resistência & Queima Calórica',
        color: '#0fb5c7',
        pos: { x: -9, y: 1.8, z: -5 },
        cam: { x: -9, y: 14, z: 4 },
        look: { x: -9, y: 0.5, z: -5 },
        image: 'public/images/gallery/gym_bikes.jpg',
        description: 'Bicicletas de alta performance Supertech STS 02 para treinos intervalados e esteiras com amortecimento articulado e monitores digitais.',
        equipment: 'Bicicletas Supertech STS 02, Esteiras Ergométricas Digitais, Monitores Cardíacos'
      },
      free_weights: {
        id: 'free_weights',
        name: 'Musculação Pesada & Halteres',
        category: 'Hipertrofia & Força Pura',
        color: '#e5c158',
        pos: { x: 7, y: 1.8, z: -4 },
        cam: { x: 7, y: 14, z: 5 },
        look: { x: 7, y: 0.5, z: -4 },
        image: 'public/images/gallery/gym_dumbbells_rack.jpg',
        description: 'Piso emborrachado com absorção de impacto, rack com pares completos de halteres sextavados emborrachados, bancos articulados e barras olímpicas.',
        equipment: 'Halteres de 2kg a 40kg, Bancos Inclináveis, Smith Machine, Barras Olímpicas'
      },
      machines: {
        id: 'machines',
        name: 'Parque de Máquinas Biomecânicas',
        category: 'Isolamento & Biomecânica',
        color: '#ffaa00',
        pos: { x: 8, y: 1.8, z: 7 },
        cam: { x: 8, y: 13, z: 14 },
        look: { x: 8, y: 0.5, z: 7 },
        image: 'public/images/gallery/gym_machines_collage.jpg',
        description: 'Equipamentos guiados modernos com polias de alta fluidez para movimentos seguros, controle articular e hipertrofia com proteção musculoesquelética.',
        equipment: 'Crossover Angular com Torre Dupla, Puxada Alta, Leg Press 45°, Cadeira Extensora'
      },
      functional: {
        id: 'functional',
        name: 'Espaço Funcional & Pista de Agilidade',
        category: 'Core, Agilidade & Alongamento',
        color: '#34d399',
        pos: { x: 0, y: 1.8, z: 0 },
        cam: { x: 0, y: 16, z: 7 },
        look: { x: 0, y: 0.5, z: 0 },
        image: 'public/images/gallery/team_community.jpg',
        description: 'Pista de grama sintética de alta densidade para aquecimento, trabalho proprioceptivo, mobilidade articular e treinos supervisionados.',
        equipment: 'Grama Sintética Funcional, Kettlebells, Colchonetes Densidade Alta, Elásticos Superband'
      }
    };

    try {
      this.initThree();
      this.createDetailedGymArchitecture();
      this.setupEventListeners();
      this.setupUIControls();
      this.selectZone('reception');
      this.animate();
    } catch (e) {
      console.error('Error initializing GymFloorplan3D:', e);
    }
  }

  initThree() {
    const width = this.container.clientWidth || 700;
    const height = this.container.clientHeight || 580;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f13);
    this.scene.fog = new THREE.FogExp2(0x0a0f13, 0.012);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 32, 26);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.05;
      this.controls.minDistance = 6;
      this.controls.maxDistance = 55;
      this.controls.target.set(0, 0, 2);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff3d6, 1.3);
    mainLight.position.set(18, 38, 18);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Neon Accent Lights
    const tealPoint = new THREE.PointLight(0x0eb0c4, 2.2, 30);
    tealPoint.position.set(-14, 5, 0);
    this.scene.add(tealPoint);

    const goldPoint = new THREE.PointLight(0xd4af37, 2.5, 30);
    goldPoint.position.set(0, 7, 8);
    this.scene.add(goldPoint);
  }

  createDetailedGymArchitecture() {
    // 1. Gym Main Floor (Dark Charcoal Rubber)
    const floorGeo = new THREE.BoxGeometry(34, 0.6, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161d22,
      roughness: 0.75,
      metalness: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor perimeter border
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x076b77, metalness: 0.6, roughness: 0.3 });
    const border = new THREE.Mesh(new THREE.BoxGeometry(34.4, 0.2, 28.4), borderMat);
    border.position.y = -0.35;
    this.scene.add(border);

    // 2. Entrance Wood Deck Floor (Reception & Lounge)
    const deckGeo = new THREE.BoxGeometry(16, 0.64, 10);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x6e4324, // Warm hardwood
      roughness: 0.5,
      metalness: 0.1
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-8, -0.28, 9);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // 3. Functional Turf Green Strip (Middle)
    const turfGeo = new THREE.BoxGeometry(4, 0.05, 18);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x227733,
      roughness: 0.9,
      metalness: 0.05
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.set(0, 0.03, -1);
    this.scene.add(turf);

    // 4. Walls
    const wallMatTeal = new THREE.MeshStandardMaterial({ color: 0x076b77, roughness: 0.5, metalness: 0.2 });
    const wallMatDark = new THREE.MeshStandardMaterial({ color: 0x11171c, roughness: 0.7 });

    // Back Wall with Immersive High-Definition Studio Video Screen Texture
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(34, 5.5, 0.8), wallMatTeal);
    backWall.position.set(0, 2.75, -14);
    this.scene.add(backWall);

    try {
      // Create HTML5 Video Element for Three.js Video Texture
      const videoEl = document.createElement('video');
      videoEl.src = 'public/videos/hero_video.mp4';
      videoEl.crossOrigin = 'anonymous';
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.play().catch(() => {});

      const videoTexture = new THREE.VideoTexture(videoEl);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;

      // Immersive Cinema Screen Displaying Official Gym Footage
      const videoScreenGeo = new THREE.PlaneGeometry(16, 4.2);
      const videoScreenMat = new THREE.MeshBasicMaterial({ map: videoTexture });
      const videoScreen = new THREE.Mesh(videoScreenGeo, videoScreenMat);
      videoScreen.position.set(0, 2.85, -13.55);
      this.scene.add(videoScreen);

      // Gold Frame Border around the 3D Video Wall
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });
      const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(16.4, 4.4, 0.1), frameMat);
      screenFrame.position.set(0, 2.85, -13.62);
      this.scene.add(screenFrame);
    } catch (err) {
      console.warn('VideoTexture initialization note:', err);
    }

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 28), wallMatDark);
    leftWall.position.set(-17, 2.75, 0);
    this.scene.add(leftWall);

    // Right Glass Wall & Mirrors
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 28), wallMatTeal);
    rightWall.position.set(17, 2.75, 0);
    this.scene.add(rightWall);

    // 5. Biofilic Green Moss Wall (Left Wall Interior)
    const mossWallGeo = new THREE.BoxGeometry(0.4, 4.8, 12);
    const mossWallMat = new THREE.MeshStandardMaterial({
      color: 0x1f5e2b,
      roughness: 0.9,
      metalness: 0.05
    });
    const mossWall = new THREE.Mesh(mossWallGeo, mossWallMat);
    mossWall.position.set(-16.4, 2.6, 0);
    this.scene.add(mossWall);

    // Glowing Neon Sign "STUDIO MACIEL" on Moss Wall
    const neonBarGeo = new THREE.BoxGeometry(0.2, 0.9, 7);
    const neonBarMat = new THREE.MeshStandardMaterial({
      color: 0xffe680,
      emissive: 0xd4af37,
      emissiveIntensity: 2.0,
      roughness: 0.1
    });
    const neonSign = new THREE.Mesh(neonBarGeo, neonBarMat);
    neonSign.position.set(-16.1, 3.2, 0);
    this.scene.add(neonSign);

    // 6. DETAILED RECEPTION & LOUNGE
    // Marble Desk with wooden slats
    const deskBase = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 1.4), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.25, metalness: 0.3 }));
    deskBase.position.set(-10, 0.9, 11);
    this.scene.add(deskBase);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 1.6), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 }));
    deskTop.position.set(-10, 1.85, 11);
    this.scene.add(deskTop);

    // Lounge Armchairs
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1f2830, roughness: 0.6 });
    [-13.5, -6.5].forEach((x) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), chairMat);
      seat.position.set(x, 0.4, 8);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.4), chairMat);
      back.position.set(x, 1.0, 7.2);
      this.scene.add(seat);
      this.scene.add(back);
    });

    // Coffee table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7 }));
    table.position.set(-10, 0.25, 8);
    this.scene.add(table);

    // 7. DETAILED CARDIO MACHINES
    // Row of 4 Detailed Treadmills
    [-14, -11.5, -9, -6.5].forEach((x) => {
      const treadGroup = new THREE.Group();
      // Deck Base
      const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 3.0), new THREE.MeshStandardMaterial({ color: 0x151b1f }));
      deckMesh.position.y = 0.12;
      treadGroup.add(deckMesh);

      // Running Belt
      const belt = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 2.6), new THREE.MeshStandardMaterial({ color: 0x090c0e, roughness: 0.9 }));
      belt.position.set(0, 0.25, -0.1);
      treadGroup.add(belt);

      // Side Posts
      const postMat = new THREE.MeshStandardMaterial({ color: 0x076b77, metalness: 0.6 });
      [-0.6, 0.6].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), postMat);
        post.position.set(px, 0.9, -1.2);
        treadGroup.add(post);
      });

      // Console Screen
      const consoleScreen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00e676, emissiveIntensity: 0.4 }));
      consoleScreen.position.set(0, 1.7, -1.2);
      consoleScreen.rotation.x = -0.3;
      treadGroup.add(consoleScreen);

      treadGroup.position.set(x, 0, -10.5);
      this.scene.add(treadGroup);
    });

    // Row of 4 Detailed Spinning Bikes (Supertech STS 02)
    [-13, -10.5, -8, -5.5].forEach((x) => {
      const bikeGroup = new THREE.Group();
      const bikeSteel = new THREE.MeshStandardMaterial({ color: 0x1b2228, metalness: 0.7, roughness: 0.3 });
      const bikeGreen = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00e676, emissiveIntensity: 0.6 });

      // Frame
      const mainTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12), bikeSteel);
      mainTube.rotation.z = 0.5;
      mainTube.position.set(-0.2, 0.8, 0);
      bikeGroup.add(mainTube);

      // Flywheel
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), bikeGreen);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0.4, 0.55, 0);
      bikeGroup.add(wheel);

      // Saddle
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
      seat.position.set(-0.5, 1.25, 0);
      bikeGroup.add(seat);

      // Handlebars
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), bikeSteel);
      bar.position.set(0.4, 1.35, 0);
      bikeGroup.add(bar);

      bikeGroup.position.set(x, 0, -4.5);
      this.scene.add(bikeGroup);
    });

    // 8. DETAILED STRENGTH & FREE WEIGHTS
    // Double-Tier Hexagonal Dumbbell Rack
    const rackGroup = new THREE.Group();
    const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x161a1d, metalness: 0.8 }));
    rackFrame.position.set(7, 0.6, -12.5);
    this.scene.add(rackFrame);

    // Rows of Hexagonal Dumbbells on rack
    for (let i = 0; i < 8; i++) {
      const dx = 2.5 + i * 1.1;
      const dbGroup = new THREE.Group();
      const hexMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 }));
      handle.rotation.z = Math.PI / 2;
      dbGroup.add(handle);

      [-0.2, 0.2].forEach((hx) => {
        const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 6), hexMat);
        hex.rotation.z = Math.PI / 2;
        hex.position.x = hx;
        dbGroup.add(hex);
      });
      dbGroup.position.set(dx, 1.25, -12.5);
      this.scene.add(dbGroup);
    }

    // 3 Adjustable Incline Benches
    [3.5, 7.5, 11.5].forEach((x) => {
      const benchGroup = new THREE.Group();
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x076b77, roughness: 0.4 });
      const pad1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.4), benchMat);
      pad1.position.set(0, 0.45, -0.2);
      const pad2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.6), benchMat);
      pad2.position.set(0, 0.45, 0.9);
      benchGroup.add(pad1);
      benchGroup.add(pad2);

      benchGroup.position.set(x, 0, -4.5);
      this.scene.add(benchGroup);
    });

    // Smith Machine with Olympic Bar & Weight Plates
    const smithGroup = new THREE.Group();
    const goldColumnMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });
    [-1.5, 1.5].forEach((sx) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.0, 0.2), goldColumnMat);
      post.position.set(sx, 2.0, 0);
      smithGroup.add(post);
    });
    const headerBar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 0.2), goldColumnMat);
    headerBar.position.set(0, 4.0, 0);
    smithGroup.add(headerBar);

    // Olympic Bar with Plates
    const smithBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 16), new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9 }));
    smithBar.rotation.z = Math.PI / 2;
    smithBar.position.set(0, 1.8, 0);
    smithGroup.add(smithBar);

    [-1.2, 1.2].forEach((px) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      plate.rotation.z = Math.PI / 2;
      plate.position.set(px, 1.8, 0);
      smithGroup.add(plate);
    });

    smithGroup.position.set(13, 0, 1.5);
    this.scene.add(smithGroup);

    // Dual Pulley Cable Crossover
    const cableGroup = new THREE.Group();
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x1f272e, metalness: 0.7 });
    [-2.2, 2.2].forEach((tx) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.8, 0.8), towerMat);
      tower.position.set(tx, 1.9, 0);
      cableGroup.add(tower);
    });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 0.2), goldColumnMat);
    arch.position.set(0, 3.7, 0);
    cableGroup.add(arch);

    cableGroup.position.set(7, 0, 8);
    this.scene.add(cableGroup);

    // 9. Floating 3D Zone Interactive Markers
    this.markerMeshes = [];
    Object.values(this.zoneData).forEach((zone) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(zone.pos.x, zone.pos.y, zone.pos.z);
      markerGroup.userData = { zoneId: zone.id };

      // Inner glowing octahedron
      const diamondGeo = new THREE.OctahedronGeometry(0.55);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: zone.color,
        emissive: zone.color,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      markerGroup.add(diamond);

      // Pulsing ring
      const ringGeo = new THREE.RingGeometry(0.7, 0.9, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.8;
      markerGroup.add(ring);

      this.scene.add(markerGroup);
      this.markerMeshes.push(markerGroup);
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    this.renderer.domElement.addEventListener('click', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.markerMeshes, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData.zoneId) {
          parent = parent.parent;
        }
        if (parent && parent.userData.zoneId) {
          this.selectZone(parent.userData.zoneId);
        }
      }
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.onWindowResize();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(this.container);
    }
  }

  setupUIControls() {
    const zoneCards = document.querySelectorAll('.zone-selector-card');
    zoneCards.forEach((card) => {
      card.addEventListener('click', () => {
        const zoneId = card.getAttribute('data-zone');
        if (zoneId) this.selectZone(zoneId);
      });
    });

    const btnTop = document.getElementById('btn-view-top');
    const btnIso = document.getElementById('btn-view-iso');
    const btnReset = document.getElementById('btn-view-reset');
    const btnRenderToggle = document.getElementById('btn-view-render-hd');

    if (btnTop) {
      btnTop.addEventListener('click', () => {
        this.animateCameraTo({ x: 0, y: 38, z: 0.1 }, { x: 0, y: 0, z: 0 });
        this.setActiveToolbarBtn(btnTop);
      });
    }

    if (btnIso) {
      btnIso.addEventListener('click', () => {
        this.animateCameraTo({ x: 18, y: 22, z: 22 }, { x: 0, y: 0, z: 0 });
        this.setActiveToolbarBtn(btnIso);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.animateCameraTo({ x: 0, y: 32, z: 26 }, { x: 0, y: 0, z: 2 });
        this.setActiveToolbarBtn(btnReset);
      });
    }

    if (btnRenderToggle) {
      btnRenderToggle.addEventListener('click', () => {
        const hdOverlay = document.getElementById('floorplan-hd-overlay');
        if (hdOverlay) {
          const isHidden = hdOverlay.style.display === 'none' || !hdOverlay.style.display;
          hdOverlay.style.display = isHidden ? 'flex' : 'none';
          btnRenderToggle.classList.toggle('active', isHidden);
        }
      });
    }
  }

  setActiveToolbarBtn(activeBtn) {
    document.querySelectorAll('.floorplan-tool-btn').forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  selectZone(zoneId) {
    const data = this.zoneData[zoneId];
    if (!data) return;

    this.activeZoneId = zoneId;

    document.querySelectorAll('.zone-selector-card').forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-zone') === zoneId);
    });

    const detailTitle = document.getElementById('zone-detail-title');
    const detailCat = document.getElementById('zone-detail-category');
    const detailDesc = document.getElementById('zone-detail-desc');
    const detailEquip = document.getElementById('zone-detail-equip');
    const detailImg = document.getElementById('zone-detail-img');

    if (detailTitle) detailTitle.textContent = data.name;
    if (detailCat) detailCat.textContent = data.category;
    if (detailDesc) detailDesc.textContent = data.description;
    if (detailEquip) detailEquip.textContent = data.equipment;
    if (detailImg) detailImg.src = data.image;

    this.animateCameraTo(data.cam, data.look);
  }

  animateCameraTo(targetPos, targetLook) {
    this.targetCameraPos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
    this.targetLookAt = new THREE.Vector3(targetLook.x, targetLook.y, targetLook.z);
    this.animatingCamera = true;
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.002;

    if (this.markerMeshes) {
      this.markerMeshes.forEach((marker, idx) => {
        marker.children[0].rotation.y = time + idx;
        marker.children[0].position.y = Math.sin(time * 2 + idx) * 0.15;
        const scale = 1 + Math.sin(time * 3 + idx) * 0.15;
        marker.children[1].scale.set(scale, scale, 1);
      });
    }

    if (this.animatingCamera && this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      if (this.controls) {
        this.controls.target.lerp(this.targetLookAt, 0.06);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.2) {
        this.animatingCamera = false;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.gymFloorplan = new GymFloorplan3D();
  }, 250);
});
