import React from 'react';
import DataTable, { IDataTableColumn } from 'react-data-table-component';
import { useFormContext, useWatch } from 'react-hook-form';
import { Control, ModalButton } from '../components';
import { Author, SubmitCorrectAbstractFormValues } from '../models';

interface IModifyProps {
  onSubmit: (author: Author) => void;
  author: Author;
  authors: Author[];
}
const Modify: React.FC<IModifyProps> = React.memo(
  ({ author, onSubmit, authors }) => {
    React.useEffect(() => {
      setState(author);
    }, []);

    const handleSubmit = () => {
      onSubmit(state);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, value } = event.currentTarget;

      if (type === 'number') {
        const num = parseInt(value, 10);
        setState({ ...state, [name]: num - 1 });
      } else {
        setState({ ...state, [name]: value });
      }
    };

    const [state, setState] = React.useState<Author>({
      aff: '',
      id: '',
      name: '',
      position: 0,
      orcid: '',
    });

    return (
      <ModalButton
        buttonText={
          <>
            <i className="fa fa-pencil" aria-hidden /> Modify
          </>
        }
        buttonStyle="default"
        buttonSize="xs"
        modalTitle="Editing author"
        onSubmit={handleSubmit}
      >
        <Control
          type="text"
          field="name"
          label="Name"
          a11yPrefix="feedback"
          onChange={handleChange}
          defaultValue={author.name}
        />
        <Control
          type="text"
          field="aff"
          label="Affiliation"
          a11yPrefix="feedback"
          onChange={handleChange}
          defaultValue={author.aff}
        />
        <Control
          type="text"
          field="orcid"
          label="ORCiD"
          a11yPrefix="feedback"
          onChange={handleChange}
          defaultValue={author.orcid}
        />
        <div className="form-group">
          <label htmlFor="feedback_author_position_spinner">Position</label>
          <input
            className="form-control"
            id="feedback_author_position_spinner"
            type="number"
            name="position"
            onChange={handleChange}
            defaultValue={author.position + 1}
            max={authors.length}
            min={1}
            step={1}
          />
        </div>
      </ModalButton>
    );
  }
);

interface IAddProps {
  onSubmit: (author: Author) => void;
}
const Add: React.FC<IAddProps> = React.memo(({ onSubmit }) => {
  const handleSubmit = () => {
    onSubmit(state);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setState({ ...state, [name]: value });
  };

  const [state, setState] = React.useState<Author>({
    aff: '',
    id: '',
    name: '',
    position: -1,
    orcid: '',
  });

  return (
    <ModalButton
      buttonText={
        <>
          <i className="fa fa-plus" aria-hidden /> Add new author
        </>
      }
      buttonStyle="default"
      buttonSize="xs"
      modalTitle="Adding new author"
      onSubmit={handleSubmit}
    >
      <Control
        type="text"
        field="name"
        label="Name"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
      <Control
        type="text"
        field="aff"
        label="Affiliation"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
      <Control
        type="text"
        field="orcid"
        label="ORCiD"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
    </ModalButton>
  );
});

const getNewAuthorList = (list: Author[], modifiedAuthor: Author): Author[] => {
  // if position changed, remove the old item
  const filteredList = list.filter((e) => e.id !== modifiedAuthor.id);

  // and insert it in the new array
  const newList = [
    ...filteredList.slice(0, modifiedAuthor.position),
    modifiedAuthor,
    ...filteredList.slice(modifiedAuthor.position),
  ];

  // re-apply the positional data
  return newList.map((e, i) => ({ ...e, position: i }));
};

const removeAuthors = (list: Author[], deletions: Author[]) => {
  const ids = deletions.map((d) => d.id);
  return list
    .filter((e) => !ids.includes(e.id))
    .map((e, i) => ({ ...e, position: i }));
};

const AuthorTable: React.FC<IAuthorTableProps> = ({ onChange, authors }) => {
  const [selected, setSelected] = React.useState<Author[]>([]);
  const [clearRows, setClearRows] = React.useState(false);

  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      const newAuthorList = removeAuthors(authors, selected);
      onChange(newAuthorList);
      setClearRows(!clearRows);
      setSelected([]);
    };

    return (
      <button type="button" onClick={handleDelete} className="btn btn-danger">
        Delete
      </button>
    );
  }, [authors, selected, clearRows]);

  const handleModifySubmit = (modifiedAuthor: Author) => {
    const newAuthorList = getNewAuthorList(authors, modifiedAuthor);
    onChange(newAuthorList);
  };

  const handleAddSubmit = (newAuthor: Author) => {
    const newAuthorList = [
      ...authors,
      {
        ...newAuthor,
        position: authors.length,
        id: `${newAuthor.name}_${authors.length}`,
      },
    ];
    onChange(newAuthorList);
  };

  const columns: IDataTableColumn<Author>[] = [
    {
      name: 'Position',
      selector: 'position',
      sortable: true,
      maxWidth: '100px',
      cell: (author) => <span>{author.position + 1}</span>,
    },
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
      maxWidth: '200px',
      cell: (author) => <span>{author.name}</span>,
    },
    {
      name: 'Affiliation',
      selector: 'aff',
      sortable: true,
      cell: (author) => <span>{author.aff}</span>,
    },
    {
      name: 'Orcid',
      selector: 'orcid',
      sortable: true,
      maxWidth: '200px',
      cell: (author) => <span>{author.orcid}</span>,
    },
    {
      name: 'Edit',
      maxWidth: '100px',
      cell: (author) => (
        <Modify
          author={author}
          onSubmit={handleModifySubmit}
          authors={authors}
        />
      ),
      button: true,
    },
  ];

  return (
    <>
      {authors.length <= 0 ? (
        <div className="form-group">
          <Add onSubmit={handleAddSubmit} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={authors}
          actions={<Add onSubmit={handleAddSubmit} />}
          pagination
          highlightOnHover
          selectableRows
          selectableRowsHighlight
          contextActions={contextActions}
          onSelectedRowsChange={({ selectedRows }) => setSelected(selectedRows)}
          clearSelectedRows={clearRows}
        />
      )}
    </>
  );
};
interface IAuthorTableProps {
  onChange: (...event: any[]) => void;
  authors: Author[];
}

const Wrapper = () => {
  const { setValue, register } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();

  React.useEffect(() => {
    register({ name: 'authors' });
  }, [register]);

  const authors = useWatch<SubmitCorrectAbstractFormValues['authors']>({
    name: 'authors',
  });

  const handleChange = (modifiedAuthors: Author[]) => {
    setValue('authors', modifiedAuthors, { shouldDirty: true });
  };

  return <AuthorTable onChange={handleChange} authors={authors || []} />;
};

export default Wrapper;
