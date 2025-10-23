import axios from 'axios';

export class ImageHelper {
  private static readonly IMAGE_URLS = [
    'https://picsum.photos/800/600', // Imagem aleatória 800x600
    'https://picsum.photos/1920/1080', // Imagem aleatória 1920x1080
    'https://picsum.photos/400/300', // Imagem aleatória 400x300
    'https://dummyimage.com/800x600/FF0000/FFFFFF&text=Test+Image+1', // Placeholder vermelho
    'https://dummyimage.com/1920x1080/00FF00/000000&text=Test+Image+2', // Placeholder verde
    'https://dummyimage.com/400x300/0000FF/FFFFFF&text=Test+Image+3', // Placeholder azul
  ];

  private static currentIndex = 0;

  /**
   * Obtém uma URL de imagem real da internet
   */
  static getRandomImageUrl(): string {
    const url = this.IMAGE_URLS[this.currentIndex % this.IMAGE_URLS.length];
    this.currentIndex++;
    return url ?? ''; // Fallback to empty string if undefined
  }

  /**
   * Obtém uma URL de imagem com dimensões específicas
   */
  static getImageUrl(width: number, height: number): string {
    return `https://picsum.photos/${width}/${height}`;
  }

  /**
   * Obtém uma URL de placeholder com texto específico
   */
  static getPlaceholderUrl(width: number, height: number, text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://dummyimage.com/${width}x${height}/FF6B6B/FFFFFF&text=${encodedText}`;
  }

  /**
   * Verifica se uma URL de imagem é acessível
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações sobre uma imagem (dimensões, tipo, etc.)
   */
  static async getImageInfo(url: string): Promise<{
    width: number;
    height: number;
    contentType: string;
    size: number;
  } | null> {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      const contentType = response.headers['content-type'] ?? 'image/jpeg';
      const contentLength = parseInt(response.headers['content-length'] ?? '0');

      // Para Picsum, podemos extrair as dimensões da URL
      if (url.includes('picsum.photos')) {
        const match = url.match(/\/(\d+)\/(\d+)/);
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (match && match[1] && match[2]) {
          return {
            width: parseInt(match[1]),
            height: parseInt(match[2]),
            contentType,
            size: contentLength,
          };
        }
      }

      // Para placeholder, também podemos extrair da URL
      if (url.includes('dummyimage.com')) {
        const match = url.match(/\/(\d+)x(\d+)/);
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (match && match[1] && match[2]) {
          return {
            width: parseInt(match[1]),
            height: parseInt(match[2]),
            contentType,
            size: contentLength,
          };
        }
      }

      // Valores padrão se não conseguir extrair
      return {
        width: 800,
        height: 600,
        contentType,
        size: contentLength,
      };
    } catch {
      return null;
    }
  }

  /**
   * Gera dados de mídia para teste com imagem real
   */
  static async generateMediaData(
    type: 'image' | 'video' = 'image',
    options?: {
      title?: string;
      tags?: string[];
      width?: number;
      height?: number;
      focal_point_x?: number;
      focal_point_y?: number;
      blur_data_url?: string;
    }
  ) {
    const width = options?.width ?? 800;
    const height = options?.height ?? 600;

    if (type === 'image') {
      const imageUrl = this.getImageUrl(width, height);
      const imageInfo = await this.getImageInfo(imageUrl);

      return {
        type: 'image',
        source: 'external',
        url: imageUrl,
        poster_url: imageUrl, // Para imagens, poster_url é a mesma URL
        width: imageInfo?.width ?? width,
        height: imageInfo?.height ?? height,
        title: options?.title ?? `Imagem de teste ${Date.now()}`,
        tags: options?.tags ?? ['teste', 'imagem'],
        focal_point_x: options?.focal_point_x,
        focal_point_y: options?.focal_point_y,
        blur_data_url: options?.blur_data_url,
      };
    } else {
      // Para vídeos, usamos um vídeo de exemplo do Pexels
      const videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
      const posterUrl = this.getImageUrl(width, height);

      return {
        type: 'video',
        source: 'external',
        url: videoUrl,
        poster_url: posterUrl,
        width,
        height,
        duration_sec: 60, // Duração estimada
        title: options?.title ?? `Vídeo de teste ${Date.now()}`,
        tags: options?.tags ?? ['teste', 'video'],
        focal_point_x: options?.focal_point_x,
        focal_point_y: options?.focal_point_y,
        blur_data_url: options?.blur_data_url,
      };
    }
  }
}
