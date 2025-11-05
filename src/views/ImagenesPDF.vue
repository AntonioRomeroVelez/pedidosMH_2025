<template>
  <div class="container py-4" style="margin-top: 80px">
    <h2 class="fw-bold mb-4 text-primary">Imprimir varias imágenes</h2>

    <!-- Input para subir imágenes -->
    <div class="mb-3">
      <input
        type="file"
        multiple
        accept="image/*"
        class="form-control"
        @change="onFileChange"
      />
      <div class="form-text">
        Puedes agregar más imágenes o eliminarlas si lo deseas.
      </div>
    </div>

    <!-- Galería de imágenes -->
    <div class="row g-3">
      <div
        v-for="(img, index) in images"
        :key="img.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <div class="card shadow-sm position-relative">
          <img
            :src="img.url"
            class="card-img-top"
            style="height: 160px; object-fit: contain; background: #f8f9fa"
            alt="Vista previa"
          />
          <div class="card-body p-2 text-center">
            <p class="small text-muted mb-0">{{ img.name }}</p>
          </div>
          <button
            type="button"
            class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
            @click="removeImage(index)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Si no hay imágenes -->
    <div v-if="!images.length" class="alert alert-secondary mt-3">
      No hay imágenes cargadas.
    </div>

    <!-- Botones de acción -->
    <div v-if="images.length" class="mt-4 d-flex flex-wrap gap-2">
      <button @click="generateOnePdfPerImage" class="btn btn-primary">
        <i class="bi bi-file-earmark-pdf me-1"></i> Un PDF por imagen
      </button>

      <button @click="generateSinglePdf" class="btn btn-success">
        <i class="bi bi-collection me-1"></i> Un solo PDF con todas
      </button>

      <button @click="printPdfDirectly" class="btn btn-warning text-dark">
        <i class="bi bi-printer me-1"></i> Imprimir directamente
      </button>

      <button @click="clearAll" class="btn btn-outline-danger ms-auto">
        <i class="bi bi-trash me-1"></i> Vaciar todo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import jsPDF from "jspdf";

const images = ref([]);

// 🔹 Cargar imágenes guardadas desde localStorage
onMounted(() => {
  const stored = localStorage.getItem("imagenes_pdf");
  if (stored) {
    try {
      images.value = JSON.parse(stored);
    } catch {
      images.value = [];
      localStorage.removeItem("imagenes_pdf");
    }
  }
});

// 🔹 Guardar automáticamente cada vez que se agreguen o eliminen imágenes
watch(
  images,
  (val) => {
    localStorage.setItem("imagenes_pdf", JSON.stringify(val));
  },
  { deep: true }
);

// 🔹 Subir imágenes (convertidas a Base64)
const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      images.value.push({
        id: crypto.randomUUID(), // ID único
        name: file.name,
        url: event.target.result, // Imagen en base64
      });
    };
    reader.readAsDataURL(file);
  }
  e.target.value = null;
};

// 🔹 Eliminar una imagen específica
const removeImage = (index) => {
  images.value.splice(index, 1);
};

// 🔹 Vaciar todas las imágenes
const clearAll = () => {
  images.value = [];
  localStorage.removeItem("imagenes_pdf");
};

// 🔹 Cargar imagen en memoria (para medir tamaño)
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });

// 🔹 Escalar proporcionalmente dentro de A4
const getScaledDimensions = (img, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return { width: img.width * ratio, height: img.height * ratio };
};

// 🔹 Generar un PDF por cada imagen
const generateOnePdfPerImage = async () => {
  for (const [index, img] of images.value.entries()) {
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height,
      undefined,
      "FAST"
    );

    pdf.save(`imagen_${index + 1}.pdf`);
  }
};

// 🔹 Generar un solo PDF con todas las imágenes
const generateSinglePdf = async () => {
  if (!images.value.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });

  for (let i = 0; i < images.value.length; i++) {
    const img = images.value[i];
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height,
      undefined,
      "FAST"
    );

    if (i < images.value.length - 1) pdf.addPage();
  }

  pdf.save("todas_imagenes_A4.pdf");
};

// 🔹 Imprimir directamente sin descargar
const printPdfDirectly = async () => {
  if (!images.value.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });

  for (let i = 0; i < images.value.length; i++) {
    const img = images.value[i];
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height,
      undefined,
      "FAST"
    );

    if (i < images.value.length - 1) pdf.addPage();
  }

  const blobUrl = pdf.output("bloburl");
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};
</script>

<style scoped>
.drag-ghost {
  opacity: 0.4;
  transform: scale(0.98);
}
</style>
