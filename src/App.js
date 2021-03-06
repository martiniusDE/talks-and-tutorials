import React from 'react';

import Header from './components/elements/Header';
import Brand from './components/elements/Brand';
import Loading from './components/elements/Loading';
import Footer from './components/elements/Footer/Footer';
import Grid from './components/layout/Grid/Grid';
import Space from './components/utilities/Space/Space';
import Card from './components/elements/Card/Card';
import Select from './components/form/Select/Select';
import Section from './components/layout/Section/Section';
import Toggle from './components/form/Toggle/Toggle';

import { videos } from './sourcesVideos.json';
import { articles } from './sourcesArticles.json';

export default class App extends React.Component {
  constructor() {
    super();

    const sources = [].concat(articles, videos);

    this.state = {
      sources: sources,
      filter: {}
    };

    this.applyFilter = this.applyFilter.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    let favs;
    try {
      favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      this.setState(prevState => ({
        sources: prevState.sources.map(source => {
          source.favorite = !!~favs.indexOf('' + source.id);
          return source;
        })
      }));
    } catch (error) {
      alert(
        'Whoops! Seems like something went wrong while reading from localStorage.'
      );
    }
  }

  handleChange(e) {
    const val = e.target.value;
    const name = e.target.name;

    if (!~name.indexOf('[]')) {
      this.setState(({ filter }) => ({
        filter: {
          ...filter,
          [name]: val
        }
      }));
    } else if (e.target.checked) {
      this.setState(({ filter }) => ({
        filter: {
          [name]: filter[name] ? [...filter[name], val] : [val]
        }
      }));
    } else {
      this.setState(({ filter }) => ({
        filter: {
          [name]: (filter[name] || []).filter(prevVal => prevVal !== val)
        }
      }));
    }
  }

  extractInformation(sourceArray) {
    let tags = {};
    let person= {};

    sourceArray.forEach(source => {
      source.tags.forEach(
        tagName => (tags[tagName] = tags[tagName] ? tags[tagName] + 1 : 1)
      );

      source.person.forEach(personName => (person[personName] = 0));
    });

    return {
      tags: tags,
      person: Object.keys(person)
    };
  }

  applyFilter(source) {
    const filter = this.state.filter;
    const filterBy = Object.keys(filter);

    let bool = true;

    filterBy.some(filterName => {
      if (Array.isArray(filter[filterName])) {
        filter[filterName].forEach(filterValue => {
          if (!~source[filterName.replace('[]', '')].indexOf(filterValue)) {
            bool = false;
            return true;
          }
        });
      } else if (
        typeof filter[filterName] === 'boolean' &&
        filter[filterName]
      ) {
        bool = !!source[filterName];
      } else if (filter[filterName]) {
        bool = !!~source[filterName].indexOf(filter[filterName]);
      }

      if (!bool) return true;
      return false;
    });

    return bool;
  }

  render() {
    const sources= this.state.sources;
    const data = sources && this.extractInformation(sources);
    const filteredSources = sources && sources.filter(this.applyFilter);

    return (
      <React.Fragment>
        <Header>
          <Brand name="Talks and Tutorials" />
        </Header>
        {sources !== null ? (
          <main>
            <Space top bottom left right>
              <Grid columns="300px 1fr" style={{ alignItems: 'self-start' }}>
                {data && (
                  <Section headline="Filter">
                    <Grid columns="1fr">
                      <Select
                        name="person"
                        label="Person"
                        onChange={this.handleChange}
                        options={data.person.map(personName => ({
                          value: personName,
                          name: personName
                        }))}
                      />
                      <Toggle
                        value="1"
                        name="favorite"
                        label="only show favorites"
                        onChange={e => {
                          let checked = e.target.checked;
                          this.setState(prevState => {
                            return {
                              filter: {
                                ...prevState.filter,
                                favorite: checked
                              }
                            };
                          });
                        }}
                      />
                      {Object.keys(data.tags).map(tagName => (
                        <Toggle
                          onChange={this.handleChange}
                          name="tags[]"
                          key={tagName}
                          label={tagName}
                          value={tagName}
                        />
                      ))}
                    </Grid>
                  </Section>
                )}
                <Grid columns="repeat(auto-fill, minmax(300px, 1fr))">
                  {filteredSources.map(({ id, ...rest }) => (
                    <Card
                      key={id}
                      id={id}
                      {...rest}
                      onChange={e => {
                        let id = e.target.value;
                        let checked = e.target.checked;
                        this.setState(
                          prevState => ({
                            sources: prevState.sources.map(source => {
                              if (source.id === +id) {
                                return {
                                  ...source,
                                  favorite: checked
                                };
                              }
                              return source;
                            })
                          }),
                          () => {
                            try {
                              let favs = JSON.parse(
                                localStorage.getItem('favorites') || '[]'
                              );
                              if (checked) {
                                favs.push(id);
                              } else {
                                favs = favs.filter(fav => fav !== id);
                              }
                              window.localStorage.setItem(
                                'favorites',
                                JSON.stringify(favs)
                              );
                            } catch (error) {
                              alert(
                                'Whoops! Seems like something went wrong while saving to localStorage.'
                              );
                            }
                          }
                        );
                      }}
                    />
                  ))}
                </Grid>
              </Grid>
            </Space>
          </main>
        ) : (
          <Loading message="Talks und Tutorials werden geladen." />
        )}
        <Footer />
      </React.Fragment>
    );
  }
}
