import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownSource = `
# Test du Support Markdown
Cette note démontre les fonctionnalités Markdown dans Spada Libreria.

ceci est un paragraphe de texte en Markdown pour tester le rendu. \
c'est une nouvelle ligne dans le même paragraphe.

## Formatage de Texte
- **Texte en gras** pour l''emphase
- *Texte en italique* pour une emphase subtile
- ***Gras et italique*** pour une emphase forte

## Listes
### Liste non ordonnée:
- Premier élément
- Deuxième élément
- Troisième élément

### Liste ordonnée:
1. Première étape
2. Deuxième étape
3. Troisième étape

## Liens
Voici un lien vers [Wikipedia](https://fr.wikipedia.org)

## Termes du Glossaire
Vous pouvez toujours utiliser les termes du glossaire comme {main} et {pied}
dans le contenu Markdown.
`


export default function MarkdownRenderer({ text, glossaryData, highlightQuery }: MarkdownRendererProps) {
    return (
  <div class = "prose prose-sm">
    {
      <Markdown
      remarkPlugins={[remarkGfm]}
      >{markdownSource}
      </Markdown>
    }
  </div>
  )
}