import pandas as pd
import csv
import wikipediaapi
import json

# fetchWikiData.py has two methods which only need to be run when "Wikipedia Image Experiment" has been updated
# (https://docs.google.com/spreadsheets/d/18DoPkfBba9lmRG05dKMaqh4IkLzk5hCuRGm6QOvHo-Q/edit?usp=sharing)

# python script to be run on the command line to generate WorldKnowledgeQs.json,
# a JSON file created from a .csv download of "Wikipedia Image Experiment"
def writeJson(csvFile):
    # create pandas DataFrame from csv file
    # for more info see https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_csv.html
    df = pd.read_csv(csvFile)

    # rename columns to be shorter and easier to call in the code
    df.columns = ['pageTitle', 'sectionTitles', 'imageURL',
    'question1', 'answer1', 'distractors1', 'question2', 'answer2', 'distractors2',
    'question3', 'answer3', 'distractors3', 'question4', 'answer4', 'distractors4',
    'imageQuestion', 'imageAnswerURL', 'imageDistractor1', 'imageDistractor2', 'imageDistractor3']

    # create WorldKnowledgeQs.json from pandas DataFrame using orient of records
    # for more info see https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_json.html
    json = df.to_json(r'WorldKnowledgeQs.json', orient='records')

    # return DataFrame of csv data (it's easier to work with in writeWikiArticles function)
    return df

# given a DataFrame df WorldKnowledgeQs, this method fetches the required
# content from Wikipedia and downloads into a JSON file (wikiArticles.json)
def writeWikiArticles(df):
    # initialize articles list of dictionaries (to be turned into a JSON file)
    articles = []

    # loop through all page titles and retrieve text from indicted section titles
    for i in range(len(df)):
        # get page and section titles from DataFrame
        pageTitle = df.loc[i]['pageTitle']
        sectionTitles = df.loc[i]['sectionTitles']

        # get Wikipedia page using wikipedia-api
        wiki_wiki = wikipediaapi.Wikipedia(
            language='en',
            extract_format=wikipediaapi.ExtractFormat.WIKI
        )
        wiki_page = wiki_wiki.page(pageTitle)

        # construct dictionary for single article at row i
        # (will always display at least main article summary first)
        singleArticle = {"pageTitle": pageTitle,
                         "sectionTitles": sectionTitles,
                         "Main": ""}

        # get text for main article summary
        singleArticle["Main"] = wiki_page.summary

        # loop through section titles and get texture
        # add key-value pair of {section title: section text}
        for s in wiki_page.sections:
            if s.title in sectionTitles:
                singleArticle.update({s.title: s.text})

        articles.append(singleArticle)

    # create JSON file WikipediaArticles.json from articles list of dictionaries
    with open('WikipediaArticles.json', 'w') as json_file:
        json.dump(articles, json_file)

df = writeJson('questions1.csv')
writeWikiArticles(df)
