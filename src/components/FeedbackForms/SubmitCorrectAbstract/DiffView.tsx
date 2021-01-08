import { ArrayChange, Change, diffArrays, diffWords } from 'diff';
import React from 'react';
import styled from 'styled-components';
import { SubmitCorrectAbstractFormValues } from '../models';

interface IDiffViewProps {
  left: SubmitCorrectAbstractFormValues;
  right: SubmitCorrectAbstractFormValues;
}
const DiffView: React.FC<IDiffViewProps> = React.memo(
  ({ left, right }) => {
    const leftObj = processTree(left);
    const rightObj = processTree(right);

    const sections = Object.keys(leftObj).map((key) => {
      const isArray = Array.isArray(leftObj[key]);
      const changes = isArray
        ? diffArrays(leftObj[key], rightObj[key])
        : diffWords(leftObj[key], rightObj[key]);

      if (
        changes.length === 1 &&
        (changes[0].count === 0 || (!changes[0].added && !changes[0].removed))
      ) {
        return null;
      }

      return (
        <Section title={key} key={key}>
          {isArray ? (
            <ArrayChanges
              keyProp={key}
              changes={changes as ArrayChange<string>[]}
            />
          ) : (
            <TextChanges
              keyProp={key}
              changes={changes as Change[]}
              right={rightObj}
            />
          )}
        </Section>
      );
    });

    return (
      <>
        {sections.filter((s) => s).length > 0 ? (
          sections
        ) : (
          <Bold>No changes detected</Bold>
        )}
      </>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps) !== JSON.stringify(nextProps)
);

interface ITextChangeElementProps {
  keyProp: string;
  changes: Change[];
  right: ProcessedFormValues;
}
const TextChanges = ({ keyProp, changes, right }: ITextChangeElementProps) => {
  return (
    <>
      <Bold>Diff:</Bold>
      {changes.reduce((list, change) => {
        if (change.added) {
          return [...list, <Add inline>{change.value}</Add>];
        } else if (change.removed) {
          return [...list, <Remove inline>{change.value}</Remove>];
        }
        return [...list, <Text inline>{change.value}</Text>];
      }, [])}
      <br />
      <br />
      <Bold>Updated:</Bold>
      <pre>{right[keyProp]}</pre>
    </>
  );
};

interface IArrayChangeElementProps {
  keyProp: string;
  changes: ArrayChange<string>[];
}
const ArrayChanges = ({ keyProp, changes }: IArrayChangeElementProps) => {
  let i = 0;
  return (
    <>
      {changes.reduce((val, change) => {
        if (change.added) {
          const currentCount = i;
          i += change.count || 0;
          return [
            ...val,
            ...change.value.map((v, idx) => (
              <Add key={`${keyProp} ${idx + currentCount}`}>{`+ ${idx +
                currentCount +
                1} ${v}`}</Add>
            )),
          ];
        } else if (change.removed) {
          return [
            ...val,
            ...change.value.map((v, idx) => (
              <Remove key={`${keyProp} ${i + idx}`}>{`- ${i +
                idx +
                1} ${v}`}</Remove>
            )),
          ];
        }
        i += change.count || 0;
        return [...val, <Text key={`${keyProp} ${i}`}>...</Text>];
      }, [])}
    </>
  );
};

const Bold = styled.p`
  font-weight: bold;
`;

const Add = styled.p`
  color: green;
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const Remove = styled.p`
  color: red;
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const Text = styled.p`
  margin: 0;
  display: ${(props: { inline?: boolean }) =>
    props.inline ? 'inline' : 'block'};
`;

const SectionTitle = styled.div`
  text-transform: capitalize;
`;

const Section: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <div className="panel panel-info">
      <SectionTitle className="panel-heading">{title}</SectionTitle>
      <div className="panel-body">{children}</div>
    </div>
  );
};

export interface ProcessedFormValues {
  affiliation: string[];
  authors: string[];
  keywords: string[];
  orcid: string[];
  collection: string[];
  urls: string[];
  references: string[];
  comments: string;
}

export const processTree = (
  obj: SubmitCorrectAbstractFormValues
): ProcessedFormValues => {
  const {
    firstname,
    lastname,
    email, // skip
    comments = '',
    entryType,
    authors = [],
    collection = [],
    urls = [],
    keywords = [],
    references = [],
    recaptcha, // skip
    ...props
  } = obj;

  return {
    ...props,
    comments,
    keywords: keywords.map(({ value }) => value),
    authors: authors.map(({ name }) => name),
    affiliation: authors.map(({ aff }) => aff),
    orcid: authors.map(({ orcid }) => orcid),
    collection: collection.filter((c) => c).map((c) => c),
    urls: urls
      .filter(({ value, type }) => type && value.length > 0)
      .map((u) => `${u.type ? `(${u.type}) ` : ''}${u.value}`),
    references: references
      .filter(({ value }) => value.length > 0)
      .map((r) => `${r.type ? `(${r.type}) ` : ''}${r.value}`),
  };
};

export default DiffView;

// String-diff output

const strikeText = (str: string) => {
  return str
    .split('')
    .map((c) => c + '\u0336')
    .join('');
};

const stringifyArrayChanges = (changes: ArrayChange<string>[]) => {
  // spread out entries
  const entries = changes.reduce((acc, change) => {
    return [
      ...acc,
      ...change.value.map((v) => ({ count: 1, ...change, value: v })),
    ];
  }, []);

  const out = [];
  let index = 1;
  for (let i = 0, j = 1; i < entries.length; i += 1, j = i + 1) {
    const count = entries[i].count || 1;
    if (
      count > 1 &&
      entries[i].removed &&
      entries[i + count].count > 1 &&
      entries[i + count].added
    ) {
      // actual change made to multiple entries in a row, they are matched by index, not sequential

      out.push(
        `${index} ${strikeText(entries[i].value)}${entries[i + count].value}`
      );
      entries[i + count] = {
        count: entries[i + count].count,
        value: entries[i + count].value,
      };
      index += 1;
    } else if (entries[i].removed && entries[j] && entries[j].added) {
      // actual change made, this should show up as text striked through

      out.push(`${index} ${strikeText(entries[i].value)}${entries[j].value}`);
      entries[j] = { value: entries[j].value, count: entries[j].count };
      index += 1;
    } else if (entries[i].removed) {
      // entry fully removed from the list, strike through full string including index

      out.push(strikeText(`${index} ${entries[i].value}`));
      index += 1;
    } else if (entries[i].added) {
      // added entry, just add a +

      out.push(`+ ${index} ${entries[i].value}`);
      index += 1;
    } else if (
      entries[i].count > 1 &&
      !entries[i].added &&
      !entries[i].removed
    ) {
      // these are just extra values in between, we're just skipping them for now
      index += 1;
    }
  }
  return out.join('\n');
};

const stringifyWordChanges = (changes: Change[]) => {
  let didTruncate = false;
  const output = changes.reduce((acc: string, change) => {
    if (change.removed) {
      acc += strikeText(change.value);
    } else {
      if (change.value.length > 60) {
        didTruncate = true;
        acc += change.value.slice(0, 60);
      } else {
        acc += change.value;
      }
    }
    return acc;
  }, '');
  if (didTruncate) {
    return `...${output}...`;
  }
  return output;
};

export function createDiffString(
  left: SubmitCorrectAbstractFormValues,
  right: SubmitCorrectAbstractFormValues
) {
  const leftObj = processTree(left);
  const rightObj = processTree(right);

  const sections = Object.keys(leftObj).map((key) => {
    const isArray = Array.isArray(leftObj[key]);

    // skip array entries that were empty to begin with
    if (isArray && leftObj[key].length === 0) {
      return null;
    }
    const changes = isArray
      ? diffArrays(leftObj[key], rightObj[key])
      : diffWords(leftObj[key], rightObj[key]);

    if (
      changes.length === 1 &&
      (changes[0].count === 0 || (!changes[0].added && !changes[0].removed))
    ) {
      return null;
    }

    const sectionTitle = key.slice(0, 1).toUpperCase() + key.slice(1);

    return `
  >>>> ${sectionTitle}
  ${
    isArray
      ? stringifyArrayChanges(changes as ArrayChange<string>[])
      : stringifyWordChanges(changes as Change[])
  }
  <<<<`;
  });

  return sections.filter((s) => s).join('\n');
}
