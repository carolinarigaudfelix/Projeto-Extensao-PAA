import { describe, expect, it } from "vitest";
import { mascararCPF } from "../validators";

describe("mascararCPF", () => {
  it("deve mascarar cpf completo mantendo primeiros 3 e últimos 2", () => {
    expect(mascararCPF("12345678900")).toBe("123.***.***-00");
  });

  it("deve aceitar cpf formatado", () => {
    expect(mascararCPF("987.654.321-99")).toBe("987.***.***-99");
  });

  it("retorna original se inválido (menos dígitos)", () => {
    expect(mascararCPF("123")).toBe("123");
  });
});
