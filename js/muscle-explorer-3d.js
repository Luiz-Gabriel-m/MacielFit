/**
 * Studio Maciel - Interactive 3D Muscle & Exercise Explorer (Three.js)
 * Anatomical athlete figure with sculpted muscle bellies & white fascia tendons
 * performing dynamic exercise motions with glowing biomechanical target highlights.
 */

class MuscleExplorer3D {
  constructor() {
    this.container = document.getElementById('muscle-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.muscleMeshes = {};
    this.equipmentGroup = null;
    this.activeExerciseId = 'bench_press';
    this.autoRotate = false;
    this.exerciseTime = 0;

    // Kinematic articulation references for dynamic exercise performance
    this.articulation = {
      root: null,
      torso: null,
      head: null,
      armL: null,
      armR: null,
      forearmL: null,
      forearmR: null,
      legL: null,
      legR: null,
      shinL: null,
      shinR: null,
      activeProps: []
    };

    this.exercises = {
      bench_press: {
        id: 'bench_press',
        name: 'Supino Reto com Barra / Halteres',
        category: 'Membros Superiores • Empurrar',
        targetMuscles: ['chest', 'deltoids_front', 'triceps'],
        primary: [{ name: 'Peitoral Maior & Menor', pct: 95 }],
        secondary: [
          { name: 'Tríceps Braquial', pct: 75 },
          { name: 'Deltoide Anterior (Ombro)', pct: 70 },
          { name: 'Serrátil Anterior & Core', pct: 40 }
        ],
        tips: 'Mantenha a retração e depressão escapular durante todo o movimento. Desça a barra controladamente até a linha do esterno e empurre com foco total na contração dos peitorais.',
        mistakes: 'Tirar as escápulas do apoio, rebater a barra no peito ou afastar os cotovelos excessivamente em 90°.',
        setsReps: '3 a 4 séries de 8 a 12 repetições • 90s de intervalo',
        equipmentType: 'barbell_bench'
      },
      squat: {
        id: 'squat',
        name: 'Agachamento Livre & Smith Machine',
        category: 'Membros Inferiores • Cadeia Global',
        targetMuscles: ['quads', 'glutes', 'hamstrings', 'core'],
        primary: [
          { name: 'Quadríceps Femoral', pct: 95 },
          { name: 'Glúteo Máximo', pct: 90 }
        ],
        secondary: [
          { name: 'Isquiotibiais (Posterior)', pct: 70 },
          { name: 'Eretores da Espinha & Core', pct: 65 },
          { name: 'Panturrilhas (Sóleo & Gastrocnêmio)', pct: 45 }
        ],
        tips: 'Pés alinhados na largura dos ombros, pontas levemente para fora. Inicie o movimento flexionando o quadril para trás e mantenha o abdômen pressurizado.',
        mistakes: 'Valgo dinâmico (joelhos fechando para dentro), arredondar a lombar ou retirar os calcanhares do piso.',
        setsReps: '4 séries de 8 a 10 repetições pesadas • 2 min de intervalo',
        equipmentType: 'squat_rack'
      },
      spinning: {
        id: 'spinning',
        name: 'Spinning Supertech STS 02',
        category: 'Cardiovascular & Resistência Muscular',
        targetMuscles: ['quads', 'calves', 'glutes', 'core'],
        primary: [
          { name: 'Quadríceps & Panturrilhas', pct: 92 },
          { name: 'Capacidade Cardiorrespiratória (VO2 Máx)', pct: 98 }
        ],
        secondary: [
          { name: 'Glúteos & Isquiotibiais', pct: 65 },
          { name: 'Core e Estabilização Lombar', pct: 50 }
        ],
        tips: 'Ajuste a altura do selim na altura da crista ilíaca. Mantenha os ombros relaxados, coluna alinhada e alterne entre tiros de alta cadência e subidas pesadas.',
        mistakes: 'Pedalar com o selim excessivamente baixo (sobrecarga patelar) ou travar os cotovelos.',
        setsReps: '30 a 45 minutos em zonas de intensidade intervalada HIIT',
        equipmentType: 'bike_3d'
      },
      lat_pulldown: {
        id: 'lat_pulldown',
        name: 'Puxada Dorsal Alta & Remada',
        category: 'Membros Superiores • Puxar',
        targetMuscles: ['back_lats', 'biceps', 'traps'],
        primary: [{ name: 'Latíssimo do Dorso (Grande Dorsal)', pct: 95 }],
        secondary: [
          { name: 'Bíceps Braquial', pct: 78 },
          { name: 'Trapézio Médio & Romboides', pct: 72 },
          { name: 'Deltoide Posterior', pct: 60 }
        ],
        tips: 'Inicie a puxada deprimindo as escápulas antes de flexionar os cotovelos. Traga a barra em direção à fúrcula esternal e sinta a musculatura dorsal contrair no pico.',
        mistakes: 'Puxar apenas com os braços sem ativar as escápulas ou inclinar o tronco exageradamente para trás.',
        setsReps: '3 a 4 séries de 10 a 12 repetições com pico de contração de 1s',
        equipmentType: 'pulldown_machine'
      },
      shoulder_press: {
        id: 'shoulder_press',
        name: 'Desenvolvimento de Ombros (Shoulder Press)',
        category: 'Deltoides • Empurrar Vertical',
        targetMuscles: ['deltoids_front', 'deltoids_side', 'triceps', 'traps'],
        primary: [{ name: 'Deltoide Anterior & Lateral (Ombro)', pct: 95 }],
        secondary: [
          { name: 'Tríceps Braquial', pct: 72 },
          { name: 'Trapézio Superior', pct: 65 },
          { name: 'Estabilizadores do Core', pct: 45 }
        ],
        tips: 'Mantenha os cotovelos ligeiramente adiantados em relação ao plano coronal. Empurre os halteres para cima sem travar bruscamente os cotovelos no topo.',
        mistakes: 'Hiperextender a lombar arqueando as costas ou descer os halteres com cotovelos desalinhados.',
        setsReps: '3 a 4 séries de 8 a 12 repetições com cadência controlada',
        equipmentType: 'dumbbells_pair'
      },
      leg_press: {
        id: 'leg_press',
        name: 'Leg Press 45° Biomecânico',
        category: 'Inferiores • Potência & Hipertrofia',
        targetMuscles: ['quads', 'glutes', 'calves'],
        primary: [
          { name: 'Quadríceps & Glúteos', pct: 94 },
          { name: 'Potência Neuromuscular', pct: 90 }
        ],
        secondary: [
          { name: 'Adutores da Coxa', pct: 68 },
          { name: 'Panturrilhas (Gastrocnêmio)', pct: 52 }
        ],
        tips: 'Apoie toda a extensão das costas e lombar no encosto. Destrave a plataforma e flexione os joelhos controladamente até 90° sem levantar o quadril.',
        mistakes: 'Tirar o quadril do banco no final da descida ou travar bruscamente a articulação dos joelhos na subida.',
        setsReps: '4 séries pirâmide crescente (12 - 10 - 8 - 6 repetições)',
        equipmentType: 'leg_press_3d'
      }
    };

    try {
      this.initThree();
      this.createAnatomicalAthlete();
      this.setupUI();
      this.selectExercise('bench_press');
      this.animate();
    } catch (err) {
      console.error('Error initializing MuscleExplorer3D:', err);
    }
  }

  initThree() {
    const width = this.container.clientWidth || 540;
    const height = this.container.clientHeight || 520;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06090c);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 2.8;
      this.controls.maxDistance = 8.5;
      this.controls.target.set(0, 0.8, 0);
    }

    // High quality lighting for anatomical muscle definition
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    keyLight.position.set(5, 8, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    rimLight.position.set(-5, 4, -4);
    this.scene.add(rimLight);

    const goldFill = new THREE.PointLight(0xffd700, 1.8, 14);
    goldFill.position.set(0, 2, 3);
    this.scene.add(goldFill);

    // Modern studio floor disc
    const discGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.08, 40);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0f161d,
      metalness: 0.85,
      roughness: 0.25
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -1.25;
    this.scene.add(disc);

    const discRing = new THREE.RingGeometry(2.5, 2.56, 40);
    const discRingMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(discRing, discRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.2;
    this.scene.add(ring);

    window.addEventListener('resize', () => this.onWindowResize());

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

  /**
   * Builds an anatomical athletic human figure inspired by classical anatomical plates:
   * crimson-red/coral muscle bellies (#b71c1c / #c0392b) with white/cream tendon fascia (#efebe9).
   * Hierarchically articulated to perform real exercise movements.
   */
  createAnatomicalAthlete() {
    this.mannequinGroup = new THREE.Group();
    this.mannequinGroup.position.set(-0.6, 0, 0);

    // Anatomical Materials
    this.muscleDefaultMat = new THREE.MeshStandardMaterial({
      color: 0xb72620, // Anatomical crimson red muscle belly
      roughness: 0.45,
      metalness: 0.15
    });

    this.tendonFasciaMat = new THREE.MeshStandardMaterial({
      color: 0xf0ece5, // Anatomical ivory white tendon fascia
      roughness: 0.35,
      metalness: 0.05
    });

    this.boneJointMat = new THREE.MeshStandardMaterial({
      color: 0xd7ccc8, // Bone cartilage
      roughness: 0.5,
      metalness: 0.1
    });

    // Root node
    const root = new THREE.Group();
    this.mannequinGroup.add(root);
    this.articulation.root = root;

    // Pelvis / Hips (Center of gravity)
    const pelvisGroup = new THREE.Group();
    pelvisGroup.position.set(0, 0.95, 0);
    root.add(pelvisGroup);

    const pelvisBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.32, 18), this.tendonFasciaMat);
    pelvisGroup.add(pelvisBase);

    // 1. GLUTES (Left & Right)
    const gluteL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), this.muscleDefaultMat.clone());
    gluteL.scale.set(0.9, 1.2, 1.1);
    gluteL.position.set(-0.14, 0.02, -0.12);
    const gluteR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), this.muscleDefaultMat.clone());
    gluteR.scale.set(0.9, 1.2, 1.1);
    gluteR.position.set(0.14, 0.02, -0.12);
    pelvisGroup.add(gluteL);
    pelvisGroup.add(gluteR);
    this.muscleMeshes['glutes'] = [gluteL, gluteR];

    // 2. TORSO GROUP (Spine, Ribcage, Pectorals, Lats, Abs)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.16, 0);
    pelvisGroup.add(torsoGroup);
    this.articulation.torso = torsoGroup;

    // Ribcage & core base
    const ribcage = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.25, 0.75, 20), this.tendonFasciaMat);
    ribcage.position.set(0, 0.45, 0);
    torsoGroup.add(ribcage);

    // 3. ABDOMINAL WALL / CORE (Six-pack with white linea alba & tendinous inscriptions)
    const coreMeshes = [];
    [-0.08, 0.08].forEach((x) => {
      [0.2, 0.34, 0.48].forEach((y) => {
        const ab = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.09), this.muscleDefaultMat.clone());
        ab.position.set(x, y, 0.19);
        torsoGroup.add(ab);
        coreMeshes.push(ab);
      });
    });
    this.muscleMeshes['core'] = coreMeshes;

    // 4. CHEST / PECTORALIS MAJOR (Left & Right with muscle striations)
    const pecGeo = new THREE.BoxGeometry(0.28, 0.25, 0.12);
    const pecL = new THREE.Mesh(pecGeo, this.muscleDefaultMat.clone());
    pecL.position.set(-0.16, 0.68, 0.18);
    pecL.rotation.z = -0.06;
    const pecR = new THREE.Mesh(pecGeo, this.muscleDefaultMat.clone());
    pecR.position.set(0.16, 0.68, 0.18);
    pecR.rotation.z = 0.06;
    torsoGroup.add(pecL);
    torsoGroup.add(pecR);
    this.muscleMeshes['chest'] = [pecL, pecR];

    // 5. BACK / LATISSIMUS DORSI & TRAPEZIUS
    const latGeo = new THREE.BoxGeometry(0.24, 0.48, 0.12);
    const latL = new THREE.Mesh(latGeo, this.muscleDefaultMat.clone());
    latL.position.set(-0.2, 0.54, -0.16);
    latL.rotation.y = 0.1;
    const latR = new THREE.Mesh(latGeo, this.muscleDefaultMat.clone());
    latR.position.set(0.2, 0.54, -0.16);
    latR.rotation.y = -0.1;
    torsoGroup.add(latL);
    torsoGroup.add(latR);

    // Trapezius muscle
    const trapGeo = new THREE.ConeGeometry(0.28, 0.35, 4);
    const traps = new THREE.Mesh(trapGeo, this.muscleDefaultMat.clone());
    traps.rotation.z = Math.PI;
    traps.position.set(0, 0.8, -0.12);
    torsoGroup.add(traps);
    this.muscleMeshes['back_lats'] = [latL, latR];
    this.muscleMeshes['traps'] = [latL, latR, traps];

    // 6. NECK & HEAD
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16), this.tendonFasciaMat);
    neck.position.set(0, 0.94, 0);
    torsoGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.2, 0);
    torsoGroup.add(headGroup);
    this.articulation.head = headGroup;

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), this.boneJointMat);
    cranium.scale.set(0.88, 1.12, 0.95);
    headGroup.add(cranium);

    // Facial muscular layer
    const faceMuscle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.14), this.muscleDefaultMat.clone());
    faceMuscle.position.set(0, -0.04, 0.12);
    headGroup.add(faceMuscle);

    // 7. SHOULDERS / DELTOIDS & ARMS (ARTICULATED)
    // Left Arm Hierarchy
    const armL = new THREE.Group();
    armL.position.set(-0.48, 0.78, 0);
    torsoGroup.add(armL);
    this.articulation.armL = armL;

    const deltL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), this.muscleDefaultMat.clone());
    deltL.scale.set(1, 1.25, 1.05);
    armL.add(deltL);

    const bicepL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.38, 16), this.muscleDefaultMat.clone());
    bicepL.position.set(0, -0.28, 0.02);
    armL.add(bicepL);

    const tendonElbowL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), this.tendonFasciaMat);
    tendonElbowL.position.set(0, -0.48, 0);
    armL.add(tendonElbowL);

    const forearmL = new THREE.Group();
    forearmL.position.set(0, -0.48, 0);
    armL.add(forearmL);
    this.articulation.forearmL = forearmL;

    const foreMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.065, 0.38, 16), this.muscleDefaultMat.clone());
    foreMeshL.position.set(0, -0.22, 0);
    forearmL.add(foreMeshL);

    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), this.tendonFasciaMat);
    handL.position.set(0, -0.44, 0);
    forearmL.add(handL);

    // Right Arm Hierarchy
    const armR = new THREE.Group();
    armR.position.set(0.48, 0.78, 0);
    torsoGroup.add(armR);
    this.articulation.armR = armR;

    const deltR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), this.muscleDefaultMat.clone());
    deltR.scale.set(1, 1.25, 1.05);
    armR.add(deltR);

    const bicepR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.38, 16), this.muscleDefaultMat.clone());
    bicepR.position.set(0, -0.28, 0.02);
    armR.add(bicepR);

    const tendonElbowR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), this.tendonFasciaMat);
    tendonElbowR.position.set(0, -0.48, 0);
    armR.add(tendonElbowR);

    const forearmR = new THREE.Group();
    forearmR.position.set(0, -0.48, 0);
    armR.add(forearmR);
    this.articulation.forearmR = forearmR;

    const foreMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.065, 0.38, 16), this.muscleDefaultMat.clone());
    foreMeshR.position.set(0, -0.22, 0);
    forearmR.add(foreMeshR);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), this.tendonFasciaMat);
    handR.position.set(0, -0.44, 0);
    forearmR.add(handR);

    this.muscleMeshes['deltoids_front'] = [deltL, deltR];
    this.muscleMeshes['deltoids_side'] = [deltL, deltR];
    this.muscleMeshes['biceps'] = [bicepL, bicepR];
    this.muscleMeshes['triceps'] = [bicepL, bicepR];

    // 8. LOWER BODY / LEGS (QUADRICEPS, HAMSTRINGS, CALVES - ARTICULATED)
    // Left Leg Hierarchy
    const legL = new THREE.Group();
    legL.position.set(-0.2, -0.1, 0);
    pelvisGroup.add(legL);
    this.articulation.legL = legL;

    const quadGeo = new THREE.CylinderGeometry(0.17, 0.12, 0.72, 18);
    const quadL = new THREE.Mesh(quadGeo, this.muscleDefaultMat.clone());
    quadL.position.set(0, -0.38, 0.04);
    legL.add(quadL);

    // Patella / Knee tendon fascia
    const patellaL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.tendonFasciaMat);
    patellaL.position.set(0, -0.76, 0.08);
    legL.add(patellaL);

    const shinL = new THREE.Group();
    shinL.position.set(0, -0.76, 0);
    legL.add(shinL);
    this.articulation.shinL = shinL;

    const calfGeo = new THREE.CylinderGeometry(0.12, 0.075, 0.72, 18);
    const calfL = new THREE.Mesh(calfGeo, this.muscleDefaultMat.clone());
    calfL.position.set(0, -0.38, -0.02);
    shinL.add(calfL);

    // Achilles tendon & Foot
    const achillesL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 12), this.tendonFasciaMat);
    achillesL.position.set(0, -0.68, -0.04);
    shinL.add(achillesL);

    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), this.tendonFasciaMat);
    footL.position.set(0, -0.78, 0.08);
    shinL.add(footL);

    // Right Leg Hierarchy
    const legR = new THREE.Group();
    legR.position.set(0.2, -0.1, 0);
    pelvisGroup.add(legR);
    this.articulation.legR = legR;

    const quadR = new THREE.Mesh(quadGeo, this.muscleDefaultMat.clone());
    quadR.position.set(0, -0.38, 0.04);
    legR.add(quadR);

    const patellaR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.tendonFasciaMat);
    patellaR.position.set(0, -0.76, 0.08);
    legR.add(patellaR);

    const shinR = new THREE.Group();
    shinR.position.set(0, -0.76, 0);
    legR.add(shinR);
    this.articulation.shinR = shinR;

    const calfR = new THREE.Mesh(calfGeo, this.muscleDefaultMat.clone());
    calfR.position.set(0, -0.38, -0.02);
    shinR.add(calfR);

    const achillesR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 12), this.tendonFasciaMat);
    achillesR.position.set(0, -0.68, -0.04);
    shinR.add(achillesR);

    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), this.tendonFasciaMat);
    footR.position.set(0, -0.78, 0.08);
    shinR.add(footR);

    this.muscleMeshes['quads'] = [quadL, quadR];
    this.muscleMeshes['hamstrings'] = [quadL, quadR];
    this.muscleMeshes['calves'] = [calfL, calfR];

    this.scene.add(this.mannequinGroup);

    // Equipment 3D Group
    this.equipmentGroup = new THREE.Group();
    this.equipmentGroup.position.set(1.2, 0, 0);
    this.scene.add(this.equipmentGroup);
  }

  /**
   * Builds realistic 3D gym equipment models based on Studio Maciel equipment inventory:
   * Barbell bench press with knurled bar and bumper plates, Supertech STS spinning bike,
   * heavy squat rack, crossover lat pulldown tower, hexagon dumbbells, and 45° leg press.
   */
  updateEquipmentModel(type) {
    if (!this.equipmentGroup) return;

    while (this.equipmentGroup.children.length > 0) {
      this.equipmentGroup.remove(this.equipmentGroup.children[0]);
    }

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.2
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1f262b,
      metalness: 0.7,
      roughness: 0.3
    });
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x076b77,
      metalness: 0.5,
      roughness: 0.4
    });

    if (type === 'barbell_bench') {
      // Olympic flat bench with teal leather pad & gold accents
      const benchBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 2.3), tealMat);
      benchBase.position.set(0, -0.55, 0);
      this.equipmentGroup.add(benchBase);

      const benchPads = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
      benchPads.position.set(0, -0.3, 0);
      this.equipmentGroup.add(benchPads);

      // Uprights / Barbell racks
      [-0.45, 0.45].forEach((z) => {
        const upright = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), darkSteelMat);
        upright.position.set(0, 0.1, z);
        this.equipmentGroup.add(upright);
      });

      // Olympic Barbell with bumper plates
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 2.4, 16), darkSteelMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.85, 0);
      this.equipmentGroup.add(bar);

      [-0.95, 0.95].forEach((x) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.09, 24), goldMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.set(x, 0.85, 0);
        this.equipmentGroup.add(plate);
      });
    } else if (type === 'bike_3d') {
      // Supertech STS 02 Spinning Bike
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 1.6), darkSteelMat);
      frame.position.set(0, -0.2, 0);
      this.equipmentGroup.add(frame);

      // Heavy perimeter flywheel
      const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.14, 28), goldMat);
      flywheel.rotation.z = Math.PI / 2;
      flywheel.position.set(0, -0.2, 0.55);
      this.equipmentGroup.add(flywheel);
      this.articulation.activeProps = [flywheel];

      // Handlebar and saddle
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      saddle.position.set(0, 0.55, -0.4);
      this.equipmentGroup.add(saddle);

      const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.25), tealMat);
      handlebar.position.set(0, 0.75, 0.5);
      this.equipmentGroup.add(handlebar);
    } else if (type === 'squat_rack') {
      // Smith Machine / Heavy Power Rack
      [-0.6, 0.6].forEach((x) => {
        [-0.5, 0.5].forEach((z) => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 0.12), darkSteelMat);
          col.position.set(x, 0.3, z);
          this.equipmentGroup.add(col);
        });
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.0), goldMat);
        topBar.position.set(x, 1.75, 0);
        this.equipmentGroup.add(topBar);
      });

      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 16), darkSteelMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.9, 0);
      this.equipmentGroup.add(bar);
    } else if (type === 'dumbbells_pair') {
      // Pair of Heavy Hexagon Dumbbells on stand
      [-0.35, 0.35].forEach((z) => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 16), darkSteelMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, 0.1, z);
        this.equipmentGroup.add(handle);

        [-0.26, 0.26].forEach((x) => {
          const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 6), goldMat);
          hex.rotation.z = Math.PI / 2;
          hex.position.set(x, 0.1, z);
          this.equipmentGroup.add(hex);
        });
      });
    } else if (type === 'leg_press_3d') {
      // 45-degree angled sled & footplate
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), darkSteelMat);
      rail1.rotation.x = -Math.PI / 4;
      rail1.position.set(-0.4, 0, 0);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), darkSteelMat);
      rail2.rotation.x = -Math.PI / 4;
      rail2.position.set(0.4, 0, 0);
      this.equipmentGroup.add(rail1);
      this.equipmentGroup.add(rail2);

      const footplate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.6), goldMat);
      footplate.rotation.x = -Math.PI / 4;
      footplate.position.set(0, 0.4, -0.4);
      this.equipmentGroup.add(footplate);
    } else {
      // Lat Pulldown Station
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.1, 0.2), darkSteelMat);
      col.position.set(0, 0.3, 0);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.2), darkSteelMat);
      arm.position.set(0, 1.75, -0.5);
      const pulldownBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 16), goldMat);
      pulldownBar.rotation.z = Math.PI / 2;
      pulldownBar.position.set(0, 1.5, -1.0);
      this.equipmentGroup.add(col);
      this.equipmentGroup.add(arm);
      this.equipmentGroup.add(pulldownBar);
    }
  }

  setupUI() {
    const pills = document.querySelectorAll('.exercise-pill-btn');
    pills.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-exercise');
        if (id) this.selectExercise(id);
      });
    });

    const btnFront = document.getElementById('btn-angle-front');
    const btnBack = document.getElementById('btn-angle-back');
    const btnSide = document.getElementById('btn-angle-side');
    const btnSpin = document.getElementById('btn-angle-spin');

    if (btnFront) {
      btnFront.addEventListener('click', () => {
        this.setCameraPreset(0, 1.2, 5.2);
        this.setActiveAngleBtn(btnFront);
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.setCameraPreset(0, 1.2, -5.2);
        this.setActiveAngleBtn(btnBack);
      });
    }

    if (btnSide) {
      btnSide.addEventListener('click', () => {
        this.setCameraPreset(5.2, 1.2, 0);
        this.setActiveAngleBtn(btnSide);
      });
    }

    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        btnSpin.classList.toggle('active', this.autoRotate);
      });
    }
  }

  setActiveAngleBtn(btn) {
    document.querySelectorAll('.view-angle-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }

  setCameraPreset(x, y, z) {
    this.autoRotate = false;
    const btnSpin = document.getElementById('btn-angle-spin');
    if (btnSpin) btnSpin.classList.remove('active');

    this.camera.position.set(x, y, z);
    if (this.controls) {
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    }
  }

  /**
   * Switches exercise:
   * 1. Resets muscle materials to base anatomical red muscle belly
   * 2. Recruits and highlights active target muscles in Electric Gold (#FFD700) and Cyan (#00E5FF)
   * 3. Resets kinematic articulation posture
   * 4. Updates coaching details & recruitment bars
   */
  selectExercise(exerciseId) {
    const data = this.exercises[exerciseId];
    if (!data) return;

    this.activeExerciseId = exerciseId;
    this.exerciseTime = 0;

    document.querySelectorAll('.exercise-pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-exercise') === exerciseId);
    });

    // Reset all muscles to anatomical muscle red
    Object.values(this.muscleMeshes).forEach((meshList) => {
      meshList.forEach((mesh) => {
        if (mesh && mesh.material) {
          mesh.material.color.setHex(0xb72620);
          mesh.material.emissive.setHex(0x000000);
          mesh.material.emissiveIntensity = 0;
          mesh.material.roughness = 0.45;
        }
      });
    });

    // Highlight target muscles with high-contrast Electric Gold & Cyan
    data.targetMuscles.forEach((muscleKey, idx) => {
      const meshes = this.muscleMeshes[muscleKey];
      if (meshes) {
        meshes.forEach((mesh) => {
          if (mesh && mesh.material) {
            if (idx === 0) {
              // Primary Target: Electric Gold
              mesh.material.color.setHex(0xffd700);
              mesh.material.emissive.setHex(0xe5c158);
              mesh.material.emissiveIntensity = 0.95;
              mesh.material.roughness = 0.2;
            } else {
              // Secondary Stabilizer: High-contrast Cyan
              mesh.material.color.setHex(0x00e5ff);
              mesh.material.emissive.setHex(0x00b0ff);
              mesh.material.emissiveIntensity = 0.7;
              mesh.material.roughness = 0.25;
            }
          }
        });
      }
    });

    // Reset base limb rotations
    this.resetMannequinPose();

    // Update 3D Equipment
    this.updateEquipmentModel(data.equipmentType);

    // Update text content
    const titleEl = document.getElementById('exercise-title');
    const catEl = document.getElementById('exercise-cat');
    const tipsEl = document.getElementById('exercise-tips');
    const mistakesEl = document.getElementById('exercise-mistakes');
    const setsEl = document.getElementById('exercise-sets');
    const barsContainer = document.getElementById('muscle-bars-container');

    if (titleEl) titleEl.textContent = data.name;
    if (catEl) catEl.textContent = data.category;
    if (tipsEl) tipsEl.textContent = data.tips;
    if (mistakesEl) mistakesEl.textContent = data.mistakes;
    if (setsEl) setsEl.textContent = data.setsReps;

    if (barsContainer) {
      let html = '';
      data.primary.forEach((p) => {
        html += `
          <div class="muscle-bar-item">
            <div class="muscle-bar-label">
              <span class="text-gold font-bold">${p.name} (Alvo Primário)</span>
              <span>${p.pct}%</span>
            </div>
            <div class="muscle-progress-track">
              <div class="muscle-progress-fill primary" style="width: ${p.pct}%;"></div>
            </div>
          </div>
        `;
      });
      data.secondary.forEach((s) => {
        html += `
          <div class="muscle-bar-item">
            <div class="muscle-bar-label">
              <span class="text-teal">${s.name} (Estabilizador)</span>
              <span>${s.pct}%</span>
            </div>
            <div class="muscle-progress-track">
              <div class="muscle-progress-fill secondary" style="width: ${s.pct}%;"></div>
            </div>
          </div>
        `;
      });
      barsContainer.innerHTML = html;
    }
  }

  resetMannequinPose() {
    const art = this.articulation;
    if (!art.root) return;

    art.root.position.set(0, 0, 0);
    art.root.rotation.set(0, 0, 0);
    if (art.torso) art.torso.rotation.set(0, 0, 0);
    if (art.head) art.head.rotation.set(0, 0, 0);
    if (art.armL) art.armL.rotation.set(0, 0, 0);
    if (art.armR) art.armR.rotation.set(0, 0, 0);
    if (art.forearmL) art.forearmL.rotation.set(0, 0, 0);
    if (art.forearmR) art.forearmR.rotation.set(0, 0, 0);
    if (art.legL) art.legL.rotation.set(0, 0, 0);
    if (art.legR) art.legR.rotation.set(0, 0, 0);
    if (art.shinL) art.shinL.rotation.set(0, 0, 0);
    if (art.shinR) art.shinR.rotation.set(0, 0, 0);
  }

  /**
   * Performs dynamic exercise kinematics in real time:
   * Squat: Hip and knee flexion cycles
   * Bench Press: Arm pressing extension and contraction
   * Spinning: High cadency cycling pedaling
   * Lat Pulldown: Arm pulling down from overhead
   * Shoulder Press: Overhead dumbbell pressing
   * Leg Press: 45° extension and flexion
   */
  updateExerciseKinematics(time) {
    const art = this.articulation;
    if (!art.root) return;

    const id = this.activeExerciseId;

    if (id === 'squat') {
      // Squat cycle: smooth down and up
      const cycle = Math.sin(time * 2.2);
      const depth = Math.max(0, cycle); // 0 (standing) to 1 (full squat)

      art.root.position.y = -depth * 0.42;
      art.torso.rotation.x = depth * 0.35; // Torso hinges forward slightly for balance

      // Thighs flex up/forward, shins angle back
      art.legL.rotation.x = -depth * 0.95;
      art.legR.rotation.x = -depth * 0.95;
      art.shinL.rotation.x = depth * 1.15;
      art.shinR.rotation.x = depth * 1.15;

      // Arms holding barbell behind neck
      art.armL.rotation.x = -0.6;
      art.armL.rotation.z = -0.5;
      art.armR.rotation.x = -0.6;
      art.armR.rotation.z = 0.5;
      art.forearmL.rotation.x = -1.2;
      art.forearmR.rotation.x = -1.2;
    } else if (id === 'bench_press') {
      // Bench press arm extension & flexion
      const pressCycle = (Math.sin(time * 2.5) + 1) * 0.5; // 0 to 1

      art.root.position.y = 0;
      art.torso.rotation.x = 0;

      // Arms pushing forward and contracting back
      const armAngle = 0.4 + pressCycle * 0.9;
      art.armL.rotation.x = -armAngle;
      art.armL.rotation.z = -0.25;
      art.armR.rotation.x = -armAngle;
      art.armR.rotation.z = 0.25;

      art.forearmL.rotation.x = -(1.2 - pressCycle * 0.9);
      art.forearmR.rotation.x = -(1.2 - pressCycle * 0.9);
    } else if (id === 'spinning') {
      // Spinning pedaling rotation
      const speed = time * 5.0;
      const legPhaseL = Math.sin(speed);
      const legPhaseR = Math.sin(speed + Math.PI);

      art.root.position.y = -0.15;
      art.torso.rotation.x = 0.45; // Cycling tuck

      // Alternating legs pedaling
      art.legL.rotation.x = -0.4 + legPhaseL * 0.45;
      art.shinL.rotation.x = 0.5 + Math.cos(speed) * 0.4;

      art.legR.rotation.x = -0.4 + legPhaseR * 0.45;
      art.shinR.rotation.x = 0.5 + Math.cos(speed + Math.PI) * 0.4;

      // Hands gripping handlebar
      art.armL.rotation.x = -0.7;
      art.armR.rotation.x = -0.7;
      art.forearmL.rotation.x = -0.8;
      art.forearmR.rotation.x = -0.8;

      if (this.articulation.activeProps[0]) {
        this.articulation.activeProps[0].rotation.y = speed * 1.5;
      }
    } else if (id === 'lat_pulldown') {
      // Overhead pull down
      const pull = (Math.sin(time * 2.4) + 1) * 0.5; // 0 (overhead) to 1 (pulled to chest)

      art.torso.rotation.x = -0.18; // Slight backward lean

      art.armL.rotation.x = -(2.4 - pull * 1.3);
      art.armL.rotation.z = -(0.7 - pull * 0.4);
      art.armR.rotation.x = -(2.4 - pull * 1.3);
      art.armR.rotation.z = 0.7 - pull * 0.4;

      art.forearmL.rotation.x = -(0.3 + pull * 1.1);
      art.forearmR.rotation.x = -(0.3 + pull * 1.1);
    } else if (id === 'shoulder_press') {
      // Overhead shoulder press
      const press = (Math.sin(time * 2.5) + 1) * 0.5; // 0 (shoulders) to 1 (overhead)

      art.armL.rotation.x = -(1.2 + press * 1.4);
      art.armL.rotation.z = -(0.4 - press * 0.2);
      art.armR.rotation.x = -(1.2 + press * 1.4);
      art.armR.rotation.z = 0.4 - press * 0.2;

      art.forearmL.rotation.x = -(0.8 - press * 0.7);
      art.forearmR.rotation.x = -(0.8 - press * 0.7);
    } else if (id === 'leg_press') {
      // Leg press extension & flexion
      const ext = (Math.sin(time * 2.3) + 1) * 0.5;

      art.root.position.y = -0.2;
      art.torso.rotation.x = -0.4; // Reclined seat

      art.legL.rotation.x = -(1.1 - ext * 0.7);
      art.legR.rotation.x = -(1.1 - ext * 0.7);
      art.shinL.rotation.x = 1.2 - ext * 0.8;
      art.shinR.rotation.x = 1.2 - ext * 0.8;

      art.armL.rotation.x = -0.3;
      art.armR.rotation.x = -0.3;
    }
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

    const time = performance.now() * 0.0015;

    // Run dynamic exercise kinematics
    this.updateExerciseKinematics(time);

    // Pulse active muscle highlight
    const glowPulse = 0.75 + Math.sin(time * 6) * 0.25;
    const targetMuscles = this.exercises[this.activeExerciseId]?.targetMuscles || [];
    targetMuscles.forEach((muscleKey, idx) => {
      const meshes = this.muscleMeshes[muscleKey];
      if (meshes) {
        meshes.forEach((mesh) => {
          if (mesh && mesh.material && mesh.material.emissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = idx === 0 ? glowPulse : 0.6;
          }
        });
      }
    });

    if (this.autoRotate && this.mannequinGroup) {
      this.mannequinGroup.rotation.y += 0.012;
      if (this.equipmentGroup) {
        this.equipmentGroup.rotation.y += 0.012;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.muscleExplorer = new MuscleExplorer3D();
  }, 300);
});
