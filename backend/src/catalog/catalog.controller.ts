import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiFoundResponse,
  ApiOkResponse,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { CatalogService } from './catalog.service.js';
import { CatalogSearchDto } from './dto/catalog-item.dto.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** Searches Scryfall; when it is unavailable, answers from the local catalog (source "cache"). */
  @Get('search')
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  @ApiErrors({ 400: true, 401: true, 403: true })
  search(
    @Query() dto: SearchCatalogDto,
    @RequestLocale() locale: Locale,
  ): Promise<CatalogSearchDto> {
    return this.catalog.search(dto, locale);
  }

  /** Serves the mirrored image, or redirects to Scryfall while the copy is pending. */
  @Public()
  @Get('items/:id/image')
  @ApiProduces('image/jpeg', 'image/png')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @ApiFoundResponse({ description: 'Redirect to the image on Scryfall' })
  @ApiErrors({ 400: true, 404: true })
  async image(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const item = await this.catalog.findImage(id);
    if (item?.image) {
      response
        .type(item.image.contentType)
        .set('Cache-Control', 'public, max-age=31536000, immutable')
        .send(Buffer.from(item.image.data));
    } else if (item?.sourceImageUrl) {
      response.redirect(item.sourceImageUrl);
    } else {
      throw new NotFoundException();
    }
  }
}
