import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Social Network API')
      .setDescription(
        'This is the API documentation for the Social Network application.',
      )
      .setVersion('1.0')
      .addTag('social-network')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        defaultModelsExpandDepth: 2,
        docExpansion: 'list',
      },
    });
  }
}
