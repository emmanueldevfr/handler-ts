module.exports = class Command {
  public name: string;
  public category: string;
  public description: string;
  public usage: string[];
  public example: string;
  public aliases: string[];
  public perms: string[];
  public botPerms: string[];
  public botNotAllowed: boolean;

  constructor(info) {
    this.name = info.name;
    this.category = info.category;
    this.description = info.description;
    this.usage = info.usage || [info.name];
    this.example = info.example || [];
    this.aliases = info.aliases || [];
    this.perms = info.perms || "everyone";
    this.botNotAllowed = info.botNotAllowed || true;
    this.botPerms = info.botPerms || [];
  }
};
