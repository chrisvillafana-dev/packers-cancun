const CLOUD_NAME = "lxvbtxbz";
const UPLOAD_PRESET = "packers_media";

export async function uploadImage(file: File): Promise<string> {

    if (!file) {
        throw new Error("No se seleccionó ninguna imagen.");
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {

        console.error("Cloudinary error:", data);

        throw new Error(
            data?.error?.message ||
            "Cloudinary rechazó la subida de la imagen."
        );
    }

    if (!data.secure_url) {
        throw new Error(
            "Cloudinary no devolvió una URL de imagen."
        );
    }

    return data.secure_url;
}