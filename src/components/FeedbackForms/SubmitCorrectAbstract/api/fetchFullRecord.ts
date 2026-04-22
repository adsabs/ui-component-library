import { apiFetch, ApiTarget } from '../../api';
import { SubmitCorrectAbstractFormValues, Url, UrlType } from '../../models';

// lodash should be a global on the page
declare var _: any;

export type FullRecord = Omit<
  SubmitCorrectAbstractFormValues,
  | 'entryType'
  | 'name'
  | 'email'
  | 'objects'
  | 'references'
  | 'comments'
  | 'recaptcha'
>;

const URL_TYPE_MAP: Record<string, UrlType> = {
  arxiv: UrlType.ARXIV,
  pdf: UrlType.PDF,
  doi: UrlType.DOI,
  html: UrlType.HTML,
};

export const transformUrl = (url: string) => {
  if (!url || typeof url !== 'string') {
    return { type: UrlType.OTHER, value: '' } as Url;
  }

  const normalizedUrl = url.toLowerCase().replace(/\/$/, '');
  const urlType = Object.keys(URL_TYPE_MAP).find((key) =>
    normalizedUrl.includes(key)
  );
  const type = urlType ? URL_TYPE_MAP[urlType] : UrlType.HTML;
  return { type, value: normalizedUrl } as Url;
};

const fetchFullRecord = _.memoize(
  async ([identifier]: [string]): Promise<FullRecord> => {
    if (identifier.length === 0) {
      throw new Error('Empty bibcode');
    }

    const response = await apiFetch({
      target: ApiTarget.SEARCH,
      query: {
        fl:
          'title,author,aff,pub_raw,pubdate,abstract,volume,bibcode,keyword,orcid_pub,database',
        q: `identifier:${identifier}`,
        rows: 1,
      },
    });

    const urlResponse = await apiFetch({
      target: `${ApiTarget.RESOLVER}/${identifier}/ESOURCE`,
      options: {
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
      },
    });

    const urls =
      urlResponse.action === 'display' && urlResponse.links?.records
        ? urlResponse.links.records.map((r) => decodeURIComponent(r.url))
        : urlResponse.action === 'redirect' && urlResponse.link
        ? [decodeURIComponent(urlResponse.link)]
        : [];

    // tranform urls to Url type
    const transformedUrls = urls
      .map((url) => transformUrl(url))
      .filter((tu) => tu.value !== '');

    if (response.response?.docs?.length > 0) {
      const {
        title = [],
        pub_raw: publication = '',
        pubdate: publicationDate = '',
        abstract = '',
        bibcode = '',
        keyword: keywords = [],
        author = [],
        aff = [],
        orcid_pub = [],
        database = [],
      } = response.response.docs[0];

      const authors = author.map((name, position) => ({
        id: `${name}_${position}`,
        position,
        name,
        aff: aff[position] !== '-' ? aff[position] : '',
        orcid: orcid_pub[position] !== '-' ? orcid_pub[position] : '',
      }));

      return {
        title: title[0],
        publication,
        publicationDate,
        abstract,
        bibcode,
        authors,
        collection: database,
        keywords: keywords.map((k) => ({ value: k })),
        urls: transformedUrls,
        confirmNoAuthor: false,
      };
    }

    throw new Error('No Result for this bibcode');
  }
);

export default fetchFullRecord;
