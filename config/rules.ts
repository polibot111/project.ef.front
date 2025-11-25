export const rules = {
  min6: (v: string) => (v && v.length >= 6) || "En az 6 karakter olmalıdır",
  required: (v: string) => !!v || "Zorunlu alan",
  email: (v: string) =>
    /.+@.+\..+/.test(v) || "Geçerli bir e-posta adresi girin",
  numeric: (v: string) => !isNaN(parseFloat(v)) || "Sayısal bir değer girin",
  phone: (v: string) => v.length === 10 || "Geçerli bir telefon numarası girin",
  url: (v: string) => /.+\..+/.test(v) || "Geçerli bir URL girin",
  fileSize: (v: File) => {
    console.log('file size', v.size);
    return v.size <= 10000000 || "Dosya boyutu 10 MB'den büyük olamaz"
  },
};
