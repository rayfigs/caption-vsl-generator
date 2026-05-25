import { renderCaptionVSL } from './render'

async function main() {
  await renderCaptionVSL({
    transcript: '',
    templateId: 'rorick-bold',
    voiceId: '',
    outputPath: '/tmp/metacasino/output/metacasino_v8_portrait_captioned.mp4',
    canvas: 'portrait',
    transcriber: 'whisper',
    inputVideo: '/tmp/metacasino/output/metacasino_v8_portrait_with_audio.mp4',
    overrides: {
      background: { type: 'solid', color: '#050508' },
      text: {
        fontFamily: 'Montserrat',
        fontSize: 72,
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
      canvas: { width: 1080, height: 1920 },
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
  console.log('Portrait captioning done!')
}

main().catch(e => { console.error(e); process.exit(1) })
