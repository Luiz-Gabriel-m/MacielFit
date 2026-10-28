/**
 * Studio Maciel - Interactive 3D Muscle & Exercise Explorer (Three.js)
 * Visualizes 3D anatomical human muscle mannequin and gym equipment with glowing biomechanical highlights.
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

    this.exercises = {
      bench_press: {
        id: 'bench_press',
        name: 'Supino Reto com Halteres / Barra',
        category: 'Membros Superiores • Empurrar',
        targetMuscles: ['chest', 'deltoids_front', 'triceps'],
        primary: [{ name: 'Peitoral Maior & Menor', pct: 95 }],
        secondary: [
          { name: 'Tríceps Braquial', pct: 75 },
          { name: 'Deltoide Anterior (Ombro)', pct: 70 },
          { name: 'Serrátil Anterior & Core', pct: 40 }
        ],
        tips: 'Mantenha a retração e depressão escapular durante todo o movimento. Desça a barra ou halteres controladamente até a linha do esterno e empurre com foco na contração peitoral.',
        mistakes: 'Tirar as escápulas do banco, rebater o peso no peito ou afastar excessivamente os cotovelos a 90°.',
        setsReps: '3 a 4 séries de 8 a 12 repetições • 90s de descanso',
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
          { name: 'Panturrilhas (Sóleo)', pct: 45 }
        ],
        tips: 'Mantenha os pés afastados na largura dos ombros, pontas levemente voltadas para fora. Inicie o movimento pelo quadril (quadril para trás) e mantenha o abdômen pressurizado.',
        mistakes: 'Valgo dinâmico (joelhos fechando para dentro), arredondar a lombar ou retirar os calcanhares do solo.',
        setsReps: '4 séries de 8 a 10 repetições pesadas • 2 min de descanso',
        equipmentType: 'squat_rack'
      },
      spinning: {
        id: 'spinning',
        name: 'Spinning Supertech STS 02',
        category: 'Cardiovascular & Resistência Muscular',
        targetMuscles: ['quads', 'calves', 'glutes', 'core'],
        primary: [
          { name: 'Quadríceps & Panturrilhas', pct: 90 },
          { name: 'Capacidade Cardiorrespiratória (VO2)', pct: 98 }
        ],
        secondary: [
          { name: 'Glúteos & Isquiotibiais', pct: 60 },
          { name: 'Core e Postura Lombar', pct: 50 }
        ],
        tips: 'Ajuste a altura do selim na altura da crista ilíaca. Mantenha os ombros relaxados, coluna alinhada e alterne entre tiros de alta cadência e subidas com resistência pesada.',
        mistakes: 'Pedalar com o selim muito baixo (sobrecarga no joelho) ou travar os cotovelos segurando o guidão.',
        setsReps: '30 a 45 minutos em zonas de intensidade intervalada HIIT',
        equipmentType: 'bike_3d'
      },
      lat_pulldown: {
        id: 'lat_pulldown',
        name: 'Puxada Alta & Remada Dorsal',
        category: 'Membros Superiores • Puxar',
        targetMuscles: ['back_lats', 'biceps', 'traps'],
        primary: [{ name: 'Latíssimo do Dorso (Grande Dorsal)', pct: 95 }],
        secondary: [
          { name: 'Bíceps Braquial', pct: 75 },
          { name: 'Trapézio & Romboides', pct: 70 },
          { name: 'Deltoide Posterior', pct: 60 }
        ],
        tips: 'Inicie a puxada deprimindo as escápulas antes de flexionar os cotovelos. Traga o puxador em direção à fúrcula esternal e sinta as costas "esmagarem" na contração máxima.',
        mistakes: 'Puxar com os braços sem ativar a musculatura das costas ou inclinar o tronco exageradamente para trás.',
        setsReps: '3 a 4 séries de 10 a 12 repetições com pico de contração de 1s',
        equipmentType: 'pulldown_machine'
      },
      shoulder_press: {
        id: 'shoulder_press',
        name: 'Desenvolvimento Militar com Halteres',
        category: 'Deltoides • Empurrar Vertical',
        targetMuscles: ['deltoids_front', 'deltoids_side', 'triceps', 'traps'],
        primary: [{ name: 'Deltoide Anterior e Lateral (Ombro)', pct: 95 }],
        secondary: [
          { name: 'Tríceps Braquial', pct: 70 },
          { name: 'Trapézio Superior', pct: 60 },
          { name: 'Estabilizadores do Core', pct: 45 }
        ],
        tips: 'Bancos a 75° a 85° para proteger a articulação do ombro. Mantenha a pegada firme e suba em trajetória de arco suave sem bater os halteres no topo.',
        mistakes: 'Hiperextender a lombar arqueando as costas ou descer os cotovelos excessivamente desalinhados.',
        setsReps: '3 séries de 8 a 12 repetições focando em cadência controlada',
        equipmentType: 'dumbbells_pair'
      },
      leg_press: {
        id: 'leg_press',
        name: 'Leg Press 45° Biomecânico',
        category: 'Inferiores • Potência & Hipertrofia',
        targetMuscles: ['quads', 'glutes', 'calves'],
        primary: [
          { name: 'Quadríceps & Glúteos', pct: 92 },
          { name: 'Força Neuromuscular', pct: 90 }
        ],
        secondary: [
          { name: 'Adutores da Coxa', pct: 65 },
          { name: 'Panturrilhas (Gastrocnêmio)', pct: 50 }
        ],
        tips: 'Apoie toda a extensão das costas e lombar no estofado. Destrave a plataforma e desça até atingir 90° de flexão sem arredondar a pelve.',
        mistakes: 'Tirar o quadril do banco no final da descida ou estender e travar o joelho totalmente na fase concêntrica.',
        setsReps: '4 séries pirâmide crescente (12 - 10 - 8 - 6 repetições)',
        equipmentType: 'leg_press_3d'
      }
    };

    try {
      this.initThree();
      this.createAnatomicalModel();
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
    this.scene.background = new THREE.Color(0x080c10);

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
      this.controls.minDistance = 3;
      this.controls.maxDistance = 8.5;
      this.controls.target.set(0, 0.8, 0);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    keyLight.position.set(5, 8, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0eb0c4, 1.6);
    rimLight.position.set(-5, 4, -4);
    this.scene.add(rimLight);

    const goldFill = new THREE.PointLight(0xd4af37, 2, 14);
    goldFill.position.set(0, 2, 3);
    this.scene.add(goldFill);

    // Floor disc
    const discGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.08, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x111920,
      metalness: 0.8,
      roughness: 0.2
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -1.25;
    this.scene.add(disc);

    const discRing = new THREE.RingGeometry(2.4, 2.46, 32);
    const discRingMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(discRing, discRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.2;
    this.scene.add(ring);

    // Resize observer
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Intersection Observer to trigger render & resize when scrolled into view
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

  createAnatomicalModel() {
    this.mannequinGroup = new THREE.Group();
    this.mannequinGroup.position.set(-0.6, 0, 0);

    // Base body material: dark futuristic chrome charcoal
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1d262d,
      roughness: 0.4,
      metalness: 0.6
    });

    // Head & Neck
    const headGeo = new THREE.SphereGeometry(0.24, 24, 24);
    headGeo.scale(0.85, 1.1, 0.95);
    const head = new THREE.Mesh(headGeo, baseMat);
    head.position.set(0, 2.35, 0);
    this.mannequinGroup.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 16);
    const neck = new THREE.Mesh(neckGeo, baseMat);
    neck.position.set(0, 2.05, 0);
    this.mannequinGroup.add(neck);

    // Torso Base
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.9, 20);
    const torso = new THREE.Mesh(torsoGeo, baseMat);
    torso.position.set(0, 1.5, 0);
    this.mannequinGroup.add(torso);

    // Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.35, 16);
    const pelvis = new THREE.Mesh(pelvisGeo, baseMat);
    pelvis.position.set(0, 0.9, 0);
    this.mannequinGroup.add(pelvis);

    // --- ANATOMICAL HIGHLIGHTABLE MUSCLE MESHES ---

    // 1. CHEST / PECTORALS (Left & Right)
    const chestGroup = new THREE.Group();
    const pecGeo = new THREE.BoxGeometry(0.26, 0.24, 0.12);
    const pecL = new THREE.Mesh(pecGeo, baseMat.clone());
    pecL.position.set(-0.16, 1.74, 0.22);
    pecL.rotation.z = -0.05;
    const pecR = new THREE.Mesh(pecGeo, baseMat.clone());
    pecR.position.set(0.16, 1.74, 0.22);
    pecR.rotation.z = 0.05;
    chestGroup.add(pecL);
    chestGroup.add(pecR);
    this.mannequinGroup.add(chestGroup);
    this.muscleMeshes['chest'] = [pecL, pecR];

    // 2. ABDOMEN / CORE (6-pack blocks)
    const coreGroup = new THREE.Group();
    const absMeshes = [];
    [-0.08, 0.08].forEach((x) => {
      [1.48, 1.34, 1.2].forEach((y) => {
        const abGeo = new THREE.BoxGeometry(0.12, 0.1, 0.08);
        const abMesh = new THREE.Mesh(abGeo, baseMat.clone());
        abMesh.position.set(x, y, 0.2);
        coreGroup.add(abMesh);
        absMeshes.push(abMesh);
      });
    });
    this.mannequinGroup.add(coreGroup);
    this.muscleMeshes['core'] = absMeshes;

    // 3. SHOULDERS / DELTOIDS
    const deltGeo = new THREE.SphereGeometry(0.18, 16, 16);
    deltGeo.scale(1, 1.2, 1);
    const deltL = new THREE.Mesh(deltGeo, baseMat.clone());
    deltL.position.set(-0.52, 1.82, 0);
    const deltR = new THREE.Mesh(deltGeo, baseMat.clone());
    deltR.position.set(0.52, 1.82, 0);
    this.mannequinGroup.add(deltL);
    this.mannequinGroup.add(deltR);
    this.muscleMeshes['deltoids_front'] = [deltL, deltR];
    this.muscleMeshes['deltoids_side'] = [deltL, deltR];

    // 4. ARMS / BICEPS & TRICEPS
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.45, 16);
    const bicepL = new THREE.Mesh(armGeo, baseMat.clone());
    bicepL.position.set(-0.54, 1.45, 0.05);
    const bicepR = new THREE.Mesh(armGeo, baseMat.clone());
    bicepR.position.set(0.54, 1.45, 0.05);
    this.mannequinGroup.add(bicepL);
    this.mannequinGroup.add(bicepR);
    this.muscleMeshes['biceps'] = [bicepL, bicepR];
    this.muscleMeshes['triceps'] = [bicepL, bicepR]; // Fixed typo: bicepL instead of biceL

    // Forearms
    const foreL = new THREE.Mesh(armGeo, baseMat);
    foreL.position.set(-0.54, 0.95, 0.05);
    const foreR = new THREE.Mesh(armGeo, baseMat);
    foreR.position.set(0.54, 0.95, 0.05);
    this.mannequinGroup.add(foreL);
    this.mannequinGroup.add(foreR);

    // 5. BACK / LATISSIMUS DORSI & TRAPS
    const latGeo = new THREE.BoxGeometry(0.24, 0.45, 0.1);
    const latL = new THREE.Mesh(latGeo, baseMat.clone());
    latL.position.set(-0.2, 1.6, -0.2);
    const latR = new THREE.Mesh(latGeo, baseMat.clone());
    latR.position.set(0.2, 1.6, -0.2);
    this.mannequinGroup.add(latL);
    this.mannequinGroup.add(latR);
    this.muscleMeshes['back_lats'] = [latL, latR];
    this.muscleMeshes['traps'] = [latL, latR];

    // 6. GLUTES
    const gluteGeo = new THREE.SphereGeometry(0.2, 16, 16);
    gluteGeo.scale(1, 1.2, 1);
    const gluteL = new THREE.Mesh(gluteGeo, baseMat.clone());
    gluteL.position.set(-0.16, 0.85, -0.15);
    const gluteR = new THREE.Mesh(gluteGeo, baseMat.clone());
    gluteR.position.set(0.16, 0.85, -0.15);
    this.mannequinGroup.add(gluteL);
    this.mannequinGroup.add(gluteR);
    this.muscleMeshes['glutes'] = [gluteL, gluteR];

    // 7. QUADRICEPS & HAMSTRINGS
    const quadGeo = new THREE.CylinderGeometry(0.16, 0.11, 0.8, 18);
    const quadL = new THREE.Mesh(quadGeo, baseMat.clone());
    quadL.position.set(-0.22, 0.3, 0.05);
    const quadR = new THREE.Mesh(quadGeo, baseMat.clone());
    quadR.position.set(0.22, 0.3, 0.05);
    this.mannequinGroup.add(quadL);
    this.mannequinGroup.add(quadR);
    this.muscleMeshes['quads'] = [quadL, quadR];
    this.muscleMeshes['hamstrings'] = [quadL, quadR];

    // 8. CALVES & LOWER LEGS
    const calfGeo = new THREE.CylinderGeometry(0.11, 0.07, 0.75, 18);
    const calfL = new THREE.Mesh(calfGeo, baseMat.clone());
    calfL.position.set(-0.22, -0.6, 0.02);
    const calfR = new THREE.Mesh(calfGeo, baseMat.clone());
    calfR.position.set(0.22, -0.6, 0.02);
    this.mannequinGroup.add(calfL);
    this.mannequinGroup.add(calfR);
    this.muscleMeshes['calves'] = [calfL, calfR];

    this.scene.add(this.mannequinGroup);

    // Equipment 3D placeholder group
    this.equipmentGroup = new THREE.Group();
    this.equipmentGroup.position.set(1.1, 0, 0);
    this.scene.add(this.equipmentGroup);
  }

  updateEquipmentModel(type) {
    if (!this.equipmentGroup) return;

    while (this.equipmentGroup.children.length > 0) {
      this.equipmentGroup.remove(this.equipmentGroup.children[0]);
    }

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
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
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 2.2), tealMat);
      bench.position.set(0, -0.6, 0);
      this.equipmentGroup.add(bench);

      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16), darkSteelMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.8, 0);
      this.equipmentGroup.add(bar);

      [-0.95, 0.95].forEach((x) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24), goldMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.set(x, 0.8, 0);
        this.equipmentGroup.add(plate);
      });
    } else if (type === 'bike_3d') {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 1.6), darkSteelMat);
      frame.position.set(0, -0.2, 0);
      this.equipmentGroup.add(frame);

      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 24), goldMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, -0.2, 0.6);
      this.equipmentGroup.add(wheel);
    } else if (type === 'dumbbells_pair') {
      [-0.4, 0.4].forEach((z) => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16), darkSteelMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, 0.2, z);
        this.equipmentGroup.add(handle);

        [-0.3, 0.3].forEach((x) => {
          const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 6), goldMat);
          hex.rotation.z = Math.PI / 2;
          hex.position.set(x, 0.2, z);
          this.equipmentGroup.add(hex);
        });
      });
    } else {
      const column1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), darkSteelMat);
      column1.position.set(-0.6, 0.2, 0);
      const column2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), darkSteelMat);
      column2.position.set(0.6, 0.2, 0);
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.16), goldMat);
      crossBeam.position.set(0, 1.5, 0);
      this.equipmentGroup.add(column1);
      this.equipmentGroup.add(column2);
      this.equipmentGroup.add(crossBeam);
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

  selectExercise(exerciseId) {
    const data = this.exercises[exerciseId];
    if (!data) return;

    this.activeExerciseId = exerciseId;

    document.querySelectorAll('.exercise-pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-exercise') === exerciseId);
    });

    // Reset muscle colors
    Object.values(this.muscleMeshes).forEach((meshList) => {
      meshList.forEach((mesh) => {
        if (mesh && mesh.material) {
          mesh.material.color.setHex(0x1d262d);
          mesh.material.emissive.setHex(0x000000);
          mesh.material.emissiveIntensity = 0;
        }
      });
    });

    // Illuminate targeted muscles with gold & teal glow
    data.targetMuscles.forEach((muscleKey, idx) => {
      const meshes = this.muscleMeshes[muscleKey];
      if (meshes) {
        meshes.forEach((mesh) => {
          if (mesh && mesh.material) {
            if (idx === 0) {
              mesh.material.color.setHex(0xd4af37);
              mesh.material.emissive.setHex(0xe5c158);
              mesh.material.emissiveIntensity = 0.9;
            } else {
              mesh.material.color.setHex(0x0eb0c4);
              mesh.material.emissive.setHex(0x076b77);
              mesh.material.emissiveIntensity = 0.6;
            }
          }
        });
      }
    });

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

    if (this.autoRotate && this.mannequinGroup) {
      this.mannequinGroup.rotation.y += 0.012;
      if (this.equipmentGroup) {
        this.equipmentGroup.rotation.y += 0.012;
      }
    }

    if (this.equipmentGroup) {
      this.equipmentGroup.position.y = Math.sin(time * 2) * 0.05;
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
