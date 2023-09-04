import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const OutputViewer = () => {

  const containerRef = useRef(null);
  useEffect(() => {
    let camera: any, scene: any, renderer: any, control: any, container: any;
    const init = async () => {
       container = containerRef.current;
      // Create a camera and scene
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      // Create a renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xeeeeee);

      // lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const light = new THREE.DirectionalLight();
      light.position.set(2.5, 2, 2);
      light.castShadow = true;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 100;
      scene.add(light);
      container.appendChild(renderer.domElement);

      // Create orbit controls
      control = new OrbitControls(camera, renderer.domElement);
      control.autoRotate = false;
      control.enablePan = true;

      // control.target = new THREE.Vector3(-3, 12, 220);
      camera.position.set(100, 100, 400);
      const response = await fetch("./test_json_compound_wrapped.json").then(
        (res) => res.json()
      );
      const meshCount = response[0].meshes.length;
      const group = new THREE.Group();

      for (let j = 0; j < meshCount; j++) {
        const meshData = response[0].meshes[j].mesh;
        const tMat = response[0].meshes[j].transforms;
        let meshColor = response[0].meshes[j].color;
        meshColor = meshColor.replace("0x", "#");
        const instCount = tMat.length;
        const transMat = [];

        for (let i = 0; i < instCount; i++) {
          const trMat = [
            [tMat[i].M00, tMat[i].M01, tMat[i].M02, tMat[i].M03],
            [tMat[i].M10, tMat[i].M11, tMat[i].M12, tMat[i].M13],
            [tMat[i].M20, tMat[i].M21, tMat[i].M22, tMat[i].M23],
            [tMat[i].M30, tMat[i].M31, tMat[i].M32, tMat[i].M33],
          ];
          transMat.push(trMat);
        }
        const geometry = await loadMeshFromBin(meshData);

        //const geometry = await loadMeshFromBin("./test_1.bin");

        const material = new THREE.MeshPhongMaterial();
        material.color.set(meshColor);
        const instancedMesh = new THREE.InstancedMesh(geometry, material, instCount);

        for (let k = 0; k < instCount; k++) {
          const arrayMatrix = transMat[k];
          const threeMatrix = new THREE.Matrix4();
          threeMatrix.fromArray(arrayMatrix.flat()).transpose();
          instancedMesh.setMatrixAt(k, threeMatrix);
        }
        instancedMesh.castShadow = true;
        group.add(instancedMesh);
      }
      scene.add(group);
      group.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1.5708);
      const boundingBox = new THREE.Box3().setFromObject(group);
      group.position.sub(boundingBox.getCenter(new THREE.Vector3()));

      // Handle window resize
      window.addEventListener('resize', onWindowResize);
      onWindowResize();
      animate(); // Start animation loop
    };
    const loadMeshFromBin = async (b64Data: any) => {
      const blob = b64toBlob(b64Data, "application/octet-stream");
      //let blob = await fetch(filepath).then((r) => r.blob());
      const arraybuffer = await blob.arrayBuffer();
      // Create a DataView to enable easier reading of binary data
      const view = new DataView(arraybuffer);
      // Prepare indices for reading
      let index = 0;
      // Read the count of vertices and faces
      const vertexCount = view.getInt32(index, true); // true for little-endian
      index += 4;
      const faceCount = view.getInt32(index, true);
      index += 4;

      // Prepare an empty geometry
      const vertices = new Float32Array(vertexCount * 3);
      const faces = new Uint32Array(faceCount * 3);
      // Read all the faces

      for (let i = 0; i < vertexCount; i++) {
        vertices[i * 3] = view.getFloat32(index, true);
        index += 4;
        vertices[i * 3 + 1] = view.getFloat32(index, true);
        index += 4;
        vertices[i * 3 + 2] = view.getFloat32(index, true);
        index += 4;
      }

      for (let i = 0; i < faceCount; i++) {
        faces[i * 3] = view.getUint16(index, true);
        index += 2;
        faces[i * 3 + 1] = view.getUint16(index, true);
        index += 2;
        faces[i * 3 + 2] = view.getUint16(index, true);
        index += 2;
      }
      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      geometry.setIndex(new THREE.BufferAttribute(faces, 1));

      geometry.computeVertexNormals();
      return geometry;
    }
    const b64toBlob = (b64Data: any, contentType = "", sliceSize = 512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    };
    const onWindowResize = () => {
      if (container && container.offsetWidth !== undefined) {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      if (control) {
        control.update();
      }
      render();
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', background: 'white' }}></div>
  );
}

export default OutputViewer;