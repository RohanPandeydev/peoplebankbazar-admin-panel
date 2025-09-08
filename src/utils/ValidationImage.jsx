const validateFileImage = (file, MAX_FILE_SIZE_MB, allowedExtensionsImage) => {
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    let isValid = true;
    let errorMessage = "";

    const fileNameParts = file.name.split(".");
    const extension = `.${fileNameParts[
        fileNameParts.length - 1
    ].toLowerCase()}`;

    if (!allowedExtensionsImage.includes(extension)) {
        isValid = false;
        errorMessage = `Invalid file extension: ${extension}. Allowed extensions are: ${allowedExtensionsImage.join(
            ", "
        )}`;
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
        isValid = false;
        errorMessage = `File size exceeds ${MAX_FILE_SIZE_MB} MB`;
    }

    return { isValid, errorMessage };
};











export const validateOgFileImage = async (file, MAX_FILE_SIZE_MB, allowedExtensionsImage) => {
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const MIN_WIDTH = 1200;
    const MIN_HEIGHT = 630;
    const IDEAL_ASPECT_RATIO = 1.91;
    const TOLERANCE = 0.05; // 5% tolerance

    const fileNameParts = file.name.split(".");
    const extension = `.${fileNameParts[fileNameParts.length - 1].toLowerCase()}`;

    if (!allowedExtensionsImage.includes(extension)) {
        return {
            isValid: false,
            errorMessage: `Invalid file extension: ${extension}. Allowed extensions are: ${allowedExtensionsImage.join(", ")}`
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            errorMessage: `File size exceeds ${MAX_FILE_SIZE_MB} MB`
        };
    }

    const dimensions = await getImageDimensions(file);

    if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
        return {
            isValid: false,
            errorMessage: `Your image is too small. It must be at least ${MIN_WIDTH}x${MIN_HEIGHT}px, but it's currently ${dimensions.width}x${dimensions.height}px.`
        };
    }

    const actualAspectRatio = dimensions.width / dimensions.height;
    const minAspect = IDEAL_ASPECT_RATIO * (1 - TOLERANCE);
    const maxAspect = IDEAL_ASPECT_RATIO * (1 + TOLERANCE);

    if (actualAspectRatio < minAspect || actualAspectRatio > maxAspect) {
        return {
            isValid: false,
            errorMessage: `The aspect ratio of your image is incorrect. It should be around ${IDEAL_ASPECT_RATIO.toFixed(2)}:1, but it's currently ${actualAspectRatio}:1.`
        };
    }

    return { isValid: true, errorMessage: "" };
};

// Helper function to get image dimensions
const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};
















export default validateFileImage