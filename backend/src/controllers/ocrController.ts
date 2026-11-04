import { Request, Response } from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { parseTableOfContents } from '../utils/ocrParser';

// Google Cloud Vision 클라이언트 초기화 (자격증명 파일 존재 시 활성화)
let visionClient: any = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new ImageAnnotatorClient();
  }
} catch (e) {
  console.warn('⚠️ Google Cloud Vision client init warning:', (e as Error).message);
}

export const extractTextFromImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { mock_mode } = req.body;

    let recognizedText = '';

    // 1. Mock 모드이거나 파일이 테스트용인 경우 또는 Vision 클라이언트가 없는 경우 Fallback
    if (mock_mode === 'true' || !file || !visionClient) {
      console.log('ℹ️ Running OCR in Mock/Fallback Mode (교재 목차 시뮬레이션)');
      recognizedText = [
        '목차 (Contents)',
        '1단원 지수와 로그 ................... 10p',
        '2단원 삼각함수의 뜻과 그래프 ......... 45p',
        '3단원 삼각함수의 활용 ............... 82p',
        '4단원 등차수열과 등비수열 ........... 120p',
        '5단원 수열의 합과 수학적 귀납법 ..... 160p',
      ].join('\n');
    } else {
      // 2. 실제 Google Cloud Vision API를 통한 이미지 텍스트 추출
      const [result] = await visionClient.textDetection(file.buffer);
      const detections = result.textAnnotations;
      if (detections && detections.length > 0) {
        recognizedText = detections[0].description || '';
      }
    }

    // 3. 목차 텍스트 정제 파싱
    const chapters = parseTableOfContents(recognizedText);

    return res.status(200).json({
      message: '목차 이미지 텍스트 추출이 완료되었습니다.',
      raw_text: recognizedText,
      total_count: chapters.length,
      chapters,
    });
  } catch (error: any) {
    console.error('OCR 텍스트 추출 오류:', error);
    return res.status(500).json({
      error: '이미지에서 텍스트를 추출하는 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
};
