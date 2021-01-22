import { apiFetch, ApiTarget } from '../../api';
import { SubmitCorrectAbstractFormValues, Url } from '../../models';

// lodash should be a global on the page
declare var _: any;

export type FullRecord = Omit<
  SubmitCorrectAbstractFormValues,
  | 'entryType'
  | 'name'
  | 'email'
  | 'collection'
  | 'objects'
  | 'references'
  | 'comments'
  | 'recaptcha'
>;

const getUrls = async (identifier: string): Promise<Url[]> => {
  const reg = /href="([^"]*)"/gi;
  try {
    const body = await fetch(`link_gateway/${identifier}/ESOURCE`);
    const raw = await body.text();
    if (raw) {
      return Array.from(
        new Set(raw.matchAll(reg)),
        (e) =>
          ({
            type: e[1].includes('arxiv')
              ? 'arxiv'
              : e[1].includes('pdf')
              ? 'pdf'
              : e[1].includes('doi')
              ? 'doi'
              : 'html',
            value: e[1],
          } as Url)
      ).slice(1);
    }
  } catch (e) {
    // do not handle
  }
  return [];
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
          'title,author,aff,pub_raw,pubdate,abstract,volume,bibcode,keyword,orcid_pub',
        q: `identifier:${identifier}`,
        rows: 1,
      },
    });

    const urls = await getUrls(identifier);

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
        keywords: keywords.map((k) => ({ value: k })),
        urls,
      };
    }

    throw new Error('No Result for this bibcode');
  }
);

export default fetchFullRecord;
