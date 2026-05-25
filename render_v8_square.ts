import { renderCaptionVSL } from './render'

async function main() {
  await renderCaptionVSL({
    transcript: '',
    templateId: 'rorick-bold',
    voiceId: '',
    outputPath: '/tmp/metacasino/output/metacasino_v8_square_captioned.mp4',
    canvas: 'square',
    transcriber: 'whisper',
    inputVideo: '/tmp/metacasino/output/metacasino_v8_square_base.mp4',
    overrides: {
      background: { type: 'solid', color: '#050508' },
      text: {
        fontFamily: 'Montserrat',
        fontSize: 56,
        fontWeight: '800',
        color: '#ffffff',
        lineHeight: 1.25,
        textAlign: 'center',
      },
      highlight: {
        enabled: true,
        type: 'word',
        color: '#050508',
        backgroundColor: '#c9882a',
      },
      canvas: { width: 1080, height: 1080 },
    },
    brand: {
      background: '#050508',
      textColor: '#ffffff',
      highlightColor: '#c9882a',
      secondaryColor: '#050508',
      headingFont: 'Montserrat',
      bodyFont: 'Montserrat',
      logoPosition: 'bottom-right',
      logoScale: 0.0,
      designOverlays: [],
      ctaText: 'reinaldofigueroa.com',
      tagline: '',
    },
  })
  console.log('Square captioning done!')
}

main().catch(e => { console.error(e); process.exit(1) })
