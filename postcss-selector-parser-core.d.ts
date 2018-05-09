declare module "postcss-selector-parser" {
  // ==== Common Node ======

  interface Position {
      line: number;
      column: number;
  }

  interface Location {
      start: Position;
      end: Position;
  }

  class SourceNode {
      source: Location;
      sourceIndex: number;
      sourceLength: number;
  }

  enum NodeOrigin {
      Root,
      Selector,
      AtRule,
      Declaration,
  }
  class Node extends SourceNode {
      origin: NodeOrigin;
      kind: KindOfNode;
      before: Array<Ignorable>;
      after: Array<Ignorable>;
  }

  // ====== Value Nodes ======

  interface HasValue<T = string> {
      value: T;
      raw: T extends string ? (T | undefined) : never; // only available when T is a string
  }

  class Value<T = string> extends Node implements HasValue<T> {
      kind: KindOfNode.Value;
      value: T;
      raw: T extends string ? (T | undefined) : never;
  }

  enum IgnorableType {
      comment = "comment",
      whitespace = "whitespace",
  }

  class Comment extends SourceNode implements HasValue {
      kind: KindOfNode.Ignorable;
      ignorableType: IgnorableType.comment;
      value: string;
      raw: string | undefined;
      open: string; // usually set to "/*" but could be "//" for single-line comments
      close: string | undefined; // single line comments and comments at the end of the file
  }

  class Whitespace extends SourceNode implements HasValue {
      kind: KindOfNode.Ignorable;
      ignorableType: IgnorableType.whitespace;
      value: string;
      raw: string | undefined;
  }

  type Ignorable = Comment | Whitespace;

  enum ValueType {
      Ident = "ident",
      String = "string",
      Literal = "literal",
  }


  class Ident extends Value {
      kind: KindOfNode.Value;
      valueType: ValueType.Ident;
  }

  class String extends Value {
      valueType: ValueType.String;
      quoteMark: "'" | '"';
  }

  class Literal<T extends string> extends Value<T> {
      valueType: ValueType.Literal;
  }



  // ====== Selector Nodes ======

  enum KindOfNode {
      Selector = "selector",
      Value = "value",
      Ignorable = "ignorable",
  }
  enum SelectorType {
      List = "list",
      Complex = "complex",
      Relative = "relative",
      Compound = "compound",
      Simple = "simple",
  }

  interface HasComplexSelectors {
      selectors: Array<ComplexSelector | RelativeSelector>;
  }

  class SelectorNode extends Node {
      kind: KindOfNode.Selector;
      selectorType: SelectorType;
  }

  // Rule would have an accessor to get a parsed selector list.
  // This is the `Root` class right now.
  class SelectorList extends SelectorNode implements HasComplexSelectors {
      selectorType: SelectorType.List;
      selectors: Array<ComplexSelector | RelativeSelector>;
  }

  class ComplexSelector extends SelectorNode {
      selectorType: SelectorType.Complex;
      readonly firstSelector: CompoundSelector; // head of the linked list
      keySelector: CompoundSelector; // The compound selector that matches the element receiving the styles.
      selectors: Array<CompoundSelector>; // random access into the linked list
      combinators: Array<Combinator>; // random access into the linked list
  }

  class Combinator extends Literal<" " | ">" | "~" | "+" | ">>>" | ""> {

  }

  // Sass and Less allow selectors to begin with a combinator,
  // so does some new pseudo selectors
  // https://drafts.csswg.org/selectors-4/#relative
  class RelativeSelector extends SelectorNode {
      selectorType: SelectorType.Relative;
      leadingCombinator: Combinator;
      readonly firstSelector: CompoundSelector; // head of the linked list
      keySelector: CompoundSelector; // The compound selector that matches the element receiving the styles.
      selectors: Array<CompoundSelector>; // random access into the linked list
      combinators: Array<Combinator>; // random access into the linked list
  }

  // linked list where the next object has a combinator and the following selector.
  class CompoundSelector extends SelectorNode {
      selectorType: SelectorType.Compound;
      selectors: Array<SimpleSelector>
      next?: {
          combinator: Combinator;
          selector?: CompoundSelector;
      }
  }

  type SimpleSelector = Identifier | ClassName | Attribute
      | PseudoClass | PseudoElement | ParentReference
      | Universal | Tag;

  enum SimpleSelectorType {
      Identifier = "identifier",
      ClassName = "class",
      Attribute = "attribute",
      PseudoClass = "pseudoclass",
      PseudoElement = "pseudoelement",
      ParentReference = "parentref",
      Universal = "univeral",
      Tag = "tag",
  }
  class Selector<T extends Value> extends SelectorNode {
      selectorType: SelectorType.Simple;
      simpleType: SimpleSelectorType;
      value: T;
  }

  interface HasNamespace {
      namespace?: Ident | Literal<"*">;
  }

  class Attribute extends Selector<String | Ident> implements HasNamespace {
      namespace?: Ident | Literal<"*">;
      simpleType: SimpleSelectorType.Attribute;
      name: Ident;
      operator?: Literal<"=" | "|=" | "^=" | "$=" | "*=" | "~=">;
      flags: Ident; // E.g. the i for case insensitivity
  }

  // A proxy for reading/writing node attributes as strings
  type Reader<T extends SimpleSelector> = {
      [P in keyof T]: T[P] extends Value<any> ? string : never;
  }

  class Identifier extends Selector<Ident> {
      simpleType: SimpleSelectorType.Identifier;
  }

  class ClassName extends Selector<Ident> {
      simpleType: SimpleSelectorType.ClassName;
  }

  // classes and elements are the same node type right now and that's
  // just weird.
  class PseudoClass extends Selector<Ident> implements HasComplexSelectors {
      simpleType: SimpleSelectorType.PseudoClass;
      selectors: (ComplexSelector | RelativeSelector)[];
      colon: ":";
  }

  class PseudoElement extends Selector<Ident> {
      simpleType: SimpleSelectorType.PseudoElement;
      colon: ":" | "::";
  }

  class Universal extends Selector<Literal<"*">> implements HasNamespace {
      namespace?: Ident | Literal<"*">;
      simpleType: SimpleSelectorType.Universal;
  }

  class ParentReference extends Selector<Literal<"&">> {
      simpleType: SimpleSelectorType.ParentReference;
  }

  class Tag extends Selector<Ident> implements HasNamespace {
      namespace?: Ident | Literal<"*">;
      simpleType: SimpleSelectorType.Tag;
  }

}