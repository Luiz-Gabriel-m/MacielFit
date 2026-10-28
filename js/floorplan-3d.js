/**
 * Studio Maciel - Interactive 3D Gym Floorplan (Three.js)
 * High-performance architectural 3D top-down & isometric view with interactive zones.
 */

class GymFloorplan3D {
  constructor() {
    this.container = document.getElementById('floorplan-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.zones = [];
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
        pos: { x: -8, y: 1.5, z: 10 },
        cam: { x: -8, y: 14, z: 18 },
        look: { x: -8, y: 0, z: 10 },
        image: 'public/images/gallery/gym_facade.jpg',
        description: 'Entrada moderna em deck de madeira nobre, poltronas confortáveis para espera, balcão de mármore e controle de acesso biométrico inteligente.',
        equipment: 'Balcão de Atendimento, Poltronas VIP, Catraca Digital, Climatização 18°C'
      },
      moss_wall: {
        id: 'moss_wall',
        name: 'Parede Verde Biofílica Instagramável',
        category: 'Ambiente & Identidade',
        color: '#2cd5eb',
        pos: { x: -14, y: 3.5, z: 2 },
        cam: { x: -8, y: 8, z: 8 },
        look: { x: -14, y: 3, z: 2 },
        image: 'public/images/gallery/gym_neon_moss.jpg',
        description: 'Nossa icônica parede de musgo verde natural com o letreiro neon dourado Studio Maciel. O ponto de encontro oficial para selfies, fotos pós-treino e registros da comunidade.',
        equipment: 'Vertical Moss Garden, Letreiro Neon Dourado Studio Maciel, Iluminação Fotográfica'
      },
      cardio: {
        id: 'cardio',
        name: 'Área Cardio & Spinning Supertech',
        category: 'Resistência & Queima Calórica',
        color: '#0fb5c7',
        pos: { x: -8, y: 1.5, z: -4 },
        cam: { x: -8, y: 16, z: 4 },
        look: { x: -8, y: 0, z: -4 },
        image: 'public/images/gallery/gym_bikes.jpg',
        description: 'Bicicletas de alta performance Supertech STS 02 para treinos intervalados e esteiras com amortecimento de impacto articulado e monitores de frequência cardíaca.',
        equipment: 'Bicicletas Supertech STS 02, Esteiras Ergométricas Digitais, Monitores Cardíacos'
      },
      free_weights: {
        id: 'free_weights',
        name: 'Musculação Pesada & Halteres',
        category: 'Hipertrofia & Força Pura',
        color: '#e5c158',
        pos: { x: 8, y: 1.5, z: -4 },
        cam: { x: 8, y: 16, z: 4 },
        look: { x: 8, y: 0, z: -4 },
        image: 'public/images/gallery/gym_dumbbells_rack.jpg',
        description: 'Piso emborrachado com absorção de impacto, rack com pares completos de halteres sextavados emborrachados, bancos articulados e barras olímpicas.',
        equipment: 'Halteres de 2kg a 40kg, Bancos Declináveis e Inclináveis, Smith Machine, Barras Olímpicas'
      },
      machines: {
        id: 'machines',
        name: 'Parque de Máquinas Biomecânicas',
        category: 'Isolamento & Biomecânica',
        color: '#ffaa00',
        pos: { x: 8, y: 1.5, z: 8 },
        cam: { x: 8, y: 15, z: 15 },
        look: { x: 8, y: 0, z: 8 },
        image: 'public/images/gallery/gym_machines_collage.jpg',
        description: 'Equipamentos guiados modernos com polias de alta fluidez para movimentos seguros, controle articular e hipertrofia com proteção musculoesquelética.',
        equipment: 'Crossover Angular, Puxada Alta, Leg Press 45°, Cadeira Extensora, Mesa Flexora'
      },
      functional: {
        id: 'functional',
        name: 'Espaço Funcional & Mobilidade',
        category: 'Core, Agilidade & Alongamento',
        color: '#34d399',
        pos: { x: 0, y: 1.5, z: 0 },
        cam: { x: 0, y: 18, z: 6 },
        look: { x: 0, y: 0, z: 0 },
        image: 'public/images/gallery/team_community.jpg',
        description: 'Área livre para aquecimento, trabalho proprioceptivo, mobilidade articular, exercícios de calistenia e treino supervisionado.',
        equipment: 'Kettlebells, Colchonetes Densidade Alta, Elásticos Superband, Bosu, Caixas de Salto'
      }
    };

    this.initThree();
    this.createGymArchitecture();
    this.setupEventListeners();
    this.setupUIControls();
    this.selectZone('reception');
    this.animate();
  }

  initThree() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f13);
    this.scene.fog = new THREE.FogExp2(0x0a0f13, 0.015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 34, 28);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.05; // Prevent seeing below floor
      this.controls.minDistance = 8;
      this.controls.maxDistance = 55;
      this.controls.target.set(0, 0, 2);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff3d6, 1.2);
    mainLight.position.set(20, 40, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    const d = 25;
    mainLight.shadow.camera.left = -d;
    mainLight.shadow.camera.right = d;
    mainLight.shadow.camera.top = d;
    mainLight.shadow.camera.bottom = -d;
    this.scene.add(mainLight);

    // Neon Accent Lights (Teal & Gold)
    const tealPoint = new THREE.PointLight(0x0eb0c4, 2, 25);
    tealPoint.position.set(-14, 6, 2);
    this.scene.add(tealPoint);

    const goldPoint = new THREE.PointLight(0xd4af37, 2, 25);
    goldPoint.position.set(0, 8, 10);
    this.scene.add(goldPoint);
  }

  createGymArchitecture() {
    // 1. Gym Main Floor (Charcoal Rubber + Perimeter Grid)
    const floorGeo = new THREE.BoxGeometry(34, 0.6, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161d22,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle Grid on floor
    const gridHelper = new THREE.GridHelper(34, 34, 0x076b77, 0x1d2931);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // 2. Entrance Wood Deck Floor (Reception & Lounge)
    const deckGeo = new THREE.BoxGeometry(16, 0.64, 10);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x6e4324, // Warm natural wood
      roughness: 0.6,
      metalness: 0.1
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-8, -0.28, 10);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // 3. Walls (Deep Teal & Architectural Glass)
    const wallMatTeal = new THREE.MeshStandardMaterial({
      color: 0x076b77,
      roughness: 0.5,
      metalness: 0.2
    });
    const wallMatDark = new THREE.MeshStandardMaterial({
      color: 0x11171c,
      roughness: 0.7
    });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(34, 6, 0.8), wallMatTeal);
    backWall.position.set(0, 3, -15);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left Wall (Features the Green Wall)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 30), wallMatDark);
    leftWall.position.set(-17, 3, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right Wall with Mirror accents
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 30), wallMatTeal);
    rightWall.position.set(17, 3, 0);
    this.scene.add(rightWall);

    // 4. Biofilic Green Moss Wall (Left interior wall)
    const mossWallGeo = new THREE.BoxGeometry(0.4, 5, 12);
    const mossWallMat = new THREE.MeshStandardMaterial({
      color: 0x1d5427,
      roughness: 0.9,
      metalness: 0.05
    });
    const mossWall = new THREE.Mesh(mossWallGeo, mossWallMat);
    mossWall.position.set(-16.4, 2.8, 2);
    this.scene.add(mossWall);

    // Glowing Neon Sign Bar on moss wall
    const neonBarGeo = new THREE.BoxGeometry(0.2, 0.8, 6);
    const neonBarMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0xd4af37,
      emissiveIntensity: 1.5,
      roughness: 0.1
    });
    const neonSign = new THREE.Mesh(neonBarGeo, neonBarMat);
    neonSign.position.set(-16.1, 3.4, 2);
    this.scene.add(neonSign);

    // 5. Reception Desk & Waiting Chairs
    const deskGeo = new THREE.BoxGeometry(4.5, 1.8, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // White marble look
      roughness: 0.3,
      metalness: 0.3
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(-10, 0.9, 12);
    desk.castShadow = true;
    this.scene.add(desk);

    // Chairs in Lounge
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1c242b });
    [-13, -6].forEach((x) => {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), chairMat);
      chair.position.set(x, 0.6, 9.5);
      chair.castShadow = true;
      this.scene.add(chair);
    });

    // 6. Cardio Machines: Spinning Bikes & Treadmills
    const bikeMat = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.6, roughness: 0.4 });
    const bikeGreenMat = new THREE.MeshStandardMaterial({ color: 0x00e676 }); // Supertech green highlight
    [-12, -9, -6].forEach((x) => {
      // Bike Base
      const bikeGroup = new THREE.Group();
      const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 1.8), bikeMat);
      bikeBody.position.y = 0.7;
      bikeGroup.add(bikeBody);

      const flyWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), bikeGreenMat);
      flyWheel.rotation.z = Math.PI / 2;
      flyWheel.position.set(0, 0.6, 0.5);
      bikeGroup.add(flyWheel);

      bikeGroup.position.set(x, 0, -4);
      bikeGroup.castShadow = true;
      this.scene.add(bikeGroup);
    });

    // Treadmills
    const treadMat = new THREE.MeshStandardMaterial({ color: 0x222a30, metalness: 0.4 });
    [-12, -9, -6].forEach((x) => {
      const treadGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.6), treadMat);
      base.position.y = 0.2;
      treadGroup.add(base);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.2), treadMat);
      screen.position.set(0, 1.0, -1.0);
      treadGroup.add(screen);

      treadGroup.position.set(x, 0, -10);
      this.scene.add(treadGroup);
    });

    // 7. Free Weights Rack & Benches
    const rackGeo = new THREE.BoxGeometry(12, 1.2, 1.4);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x121416, metalness: 0.8, roughness: 0.3 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(8, 0.6, -13.5);
    rack.castShadow = true;
    this.scene.add(rack);

    // Adjustable Benches
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x076b77, roughness: 0.5 });
    [4, 8, 12].forEach((x) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 2.2), benchMat);
      bench.position.set(x, 0.35, -5);
      bench.castShadow = true;
      this.scene.add(bench);
    });

    // Smith Machine
    const smithGroup = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(0.3, 3.8, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    const post1 = new THREE.Mesh(frameGeo, frameMat);
    post1.position.set(-1.4, 1.9, 0);
    const post2 = new THREE.Mesh(frameGeo, frameMat);
    post2.position.set(1.4, 1.9, 0);
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.3, 0.3), frameMat);
    topBar.position.set(0, 3.8, 0);
    smithGroup.add(post1);
    smithGroup.add(post2);
    smithGroup.add(topBar);
    smithGroup.position.set(12, 0, 0);
    this.scene.add(smithGroup);

    // 8. 3D Zone Interactive Markers (Pulsating Rings & Floating Icons)
    this.markerMeshes = [];
    Object.values(this.zoneData).forEach((zone) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(zone.pos.x, zone.pos.y, zone.pos.z);
      markerGroup.userData = { zoneId: zone.id };

      // Inner glowing diamond
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

      // Pulsing Ring below
      const ringGeo = new THREE.RingGeometry(0.7, 0.9, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
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

    // Raycast click on canvas
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
  }

  setupUIControls() {
    // Zone cards click
    const zoneCards = document.querySelectorAll('.zone-selector-card');
    zoneCards.forEach((card) => {
      card.addEventListener('click', () => {
        const zoneId = card.getAttribute('data-zone');
        if (zoneId) this.selectZone(zoneId);
      });
    });

    // View Toolbar Buttons
    const btnTop = document.getElementById('btn-view-top');
    const btnIso = document.getElementById('btn-view-iso');
    const btnReset = document.getElementById('btn-view-reset');

    if (btnTop) {
      btnTop.addEventListener('click', () => {
        this.animateCameraTo({ x: 0, y: 38, z: 0.1 }, { x: 0, y: 0, z: 0 });
        this.setActiveToolbarBtn(btnTop);
      });
    }

    if (btnIso) {
      btnIso.addEventListener('click', () => {
        this.animateCameraTo({ x: 20, y: 24, z: 24 }, { x: 0, y: 0, z: 0 });
        this.setActiveToolbarBtn(btnIso);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.animateCameraTo({ x: 0, y: 32, z: 26 }, { x: 0, y: 0, z: 2 });
        this.setActiveToolbarBtn(btnReset);
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

    // Highlight zone list in sidebar
    document.querySelectorAll('.zone-selector-card').forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-zone') === zoneId);
    });

    // Update Zone Detail card in sidebar
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

    // Smoothly animate camera to look at selected zone
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
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.002;

    // Animate 3D floating markers
    if (this.markerMeshes) {
      this.markerMeshes.forEach((marker, idx) => {
        marker.children[0].rotation.y = time + idx;
        marker.children[0].position.y = Math.sin(time * 2 + idx) * 0.15;
        // Ring pulsing scale
        const scale = 1 + Math.sin(time * 3 + idx) * 0.15;
        marker.children[1].scale.set(scale, scale, 1);
      });
    }

    // Camera animation interpolation
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
  // Initialize floorplan after slight delay or when section is near
  setTimeout(() => {
    window.gymFloorplan = new GymFloorplan3D();
  }, 300);
});
