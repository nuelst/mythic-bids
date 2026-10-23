import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { CatalogService } from './catalog.service.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('search')
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  search(@Query() dto: SearchCatalogDto, @RequestLocale() locale: Locale) {
    return this.catalog.search(dto, locale);
  }

  /** Serves the mirrored image, or redirects to Scryfall while the copy is pending. */
  @Public()
  @Get('items/:id/image')
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
