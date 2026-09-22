module.exports = {
  plugins: {
    // Resuelve los @import del canónico (design-system/) en build para
    // que webpack/Next no intente sacarlos fuera de app/.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};